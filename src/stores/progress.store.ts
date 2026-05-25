import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  makeSectionKey,
  type ActiveSession,
  type SectionKey,
  type SessionAnswer,
} from '@/types/quiz.types'

export interface SectionStats {
  answered: number
  correct: number
}

export interface ProgressState {
  wrongBySection: Record<SectionKey, string[]>
  answeredIdsBySection: Record<SectionKey, string[]>
  sectionStats: Record<SectionKey, SectionStats>
}

const STORAGE_STATS = 'vq:stats'
const STORAGE_SESSION = 'vq:session'
const STORAGE_STATS_LEGACY = 'learn-vue-progress'

const defaultStats = (): ProgressState => ({
  wrongBySection: {},
  answeredIdsBySection: {},
  sectionStats: {},
})

function migrateLegacyStats(): ProgressState | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const legacy = localStorage.getItem(STORAGE_STATS_LEGACY)
    if (!legacy) return null
    const parsed = JSON.parse(legacy) as Partial<ProgressState>
    localStorage.removeItem(STORAGE_STATS_LEGACY)
    return {
      wrongBySection: parsed.wrongBySection ?? {},
      answeredIdsBySection: parsed.answeredIdsBySection ?? {},
      sectionStats: parsed.sectionStats ?? {},
    }
  } catch {
    return null
  }
}

function isValidSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.moduleId === 'string' &&
    typeof v.sectionId === 'string' &&
    typeof v.mode === 'string' &&
    Array.isArray(v.queue) &&
    typeof v.currentIndex === 'number' &&
    typeof v.history === 'object' &&
    v.history !== null
  )
}

function readPersistedSession(): ActiveSession | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_SESSION)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidSession(parsed)) {
      localStorage.removeItem(STORAGE_SESSION)
      return null
    }
    return parsed
  } catch {
    try { localStorage.removeItem(STORAGE_SESSION) } catch { /* ignore */ }
    return null
  }
}

export const useProgressStore = defineStore('progress', () => {
  const legacy = migrateLegacyStats()
  const statsSerializer = {
    read: (raw: string): ProgressState => {
      try { return JSON.parse(raw) }
      catch { return defaultStats() }
    },
    write: (value: ProgressState): string => JSON.stringify(value),
  }
  const stats = useLocalStorage<ProgressState>(
    STORAGE_STATS,
    legacy ?? defaultStats(),
    { mergeDefaults: true, writeDefaults: false, serializer: statsSerializer },
  )

  const validatedInitial = readPersistedSession()
  const jsonSerializer = {
    read: (raw: string): ActiveSession | null => {
      try { return JSON.parse(raw) }
      catch { return null }
    },
    write: (value: ActiveSession | null): string => JSON.stringify(value),
  }
  const session = useLocalStorage<ActiveSession | null>(
    STORAGE_SESSION,
    validatedInitial,
    { writeDefaults: false, serializer: jsonSerializer },
  )

  function sectionKey(moduleId: string, sectionId: string): SectionKey {
    return makeSectionKey(moduleId, sectionId)
  }

  function getWrongIds(moduleId: string, sectionId: string): string[] {
    return stats.value.wrongBySection[sectionKey(moduleId, sectionId)] ?? []
  }

  function getAnsweredIds(moduleId: string, sectionId: string): string[] {
    return stats.value.answeredIdsBySection[sectionKey(moduleId, sectionId)] ?? []
  }

  function getAnsweredCount(moduleId: string, sectionId: string): number {
    return getAnsweredIds(moduleId, sectionId).length
  }

  function getWrongCount(moduleId: string, sectionId: string): number {
    return getWrongIds(moduleId, sectionId).length
  }

  function getSectionStats(moduleId: string, sectionId: string): SectionStats {
    return stats.value.sectionStats[sectionKey(moduleId, sectionId)] ?? { answered: 0, correct: 0 }
  }

  function getModuleWrongCount(moduleId: string, sectionIds: string[]): number {
    return sectionIds.reduce((sum, sid) => sum + getWrongCount(moduleId, sid), 0)
  }

  function addWrong(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = stats.value.wrongBySection[key] ?? []
    if (!current.includes(questionId)) {
      stats.value.wrongBySection[key] = [...current, questionId]
    }
  }

  function markAnswered(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = stats.value.answeredIdsBySection[key] ?? []
    if (!current.includes(questionId)) {
      stats.value.answeredIdsBySection[key] = [...current, questionId]
    }
  }

  function removeWrong(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = stats.value.wrongBySection[key] ?? []
    stats.value.wrongBySection[key] = current.filter((id) => id !== questionId)
  }

  function recordAnswer(
    moduleId: string,
    sectionId: string,
    questionId: string,
    isCorrect: boolean,
  ) {
    const key = sectionKey(moduleId, sectionId)
    const current = stats.value.sectionStats[key] ?? { answered: 0, correct: 0 }
    stats.value.sectionStats[key] = {
      answered: current.answered + 1,
      correct: current.correct + (isCorrect ? 1 : 0),
    }
    markAnswered(moduleId, sectionId, questionId)
    if (isCorrect) removeWrong(moduleId, sectionId, questionId)
    else addWrong(moduleId, sectionId, questionId)
  }

  function clearSectionWrong(moduleId: string, sectionId: string) {
    stats.value.wrongBySection[sectionKey(moduleId, sectionId)] = []
  }

  function resetSection(moduleId: string, sectionId: string) {
    const key = sectionKey(moduleId, sectionId)
    stats.value.wrongBySection[key] = []
    stats.value.answeredIdsBySection[key] = []
    delete stats.value.sectionStats[key]
    if (session.value?.moduleId === moduleId && session.value?.sectionId === sectionId) {
      session.value = null
    }
  }

  function getActiveSession(): ActiveSession | null {
    return session.value
  }

  function hasResumableSession(moduleId: string, sectionId: string, mode: ActiveSession['mode']): boolean {
    const s = session.value
    return Boolean(
      s && Array.isArray(s.queue) && s.moduleId === moduleId && s.sectionId === sectionId && s.mode === mode && s.queue.length > 0,
    )
  }

  function startSession(initial: Omit<ActiveSession, 'startedAt' | 'updatedAt'>) {
    const now = Date.now()
    session.value = { ...initial, startedAt: now, updatedAt: now }
  }

  function patchSession(patch: Partial<ActiveSession>) {
    if (!session.value) return
    session.value = { ...session.value, ...patch, updatedAt: Date.now() }
  }

  function recordSessionAnswer(questionId: string, answer: SessionAnswer) {
    if (!session.value) return
    session.value = {
      ...session.value,
      history: { ...session.value.history, [questionId]: answer },
      updatedAt: Date.now(),
    }
  }

  function clearSession() {
    session.value = null
  }

  const wrongBySection = computed(() => stats.value.wrongBySection)
  const sectionStats = computed(() => stats.value.sectionStats)
  const activeSession = computed(() => session.value)

  return {
    wrongBySection, sectionStats, activeSession,
    getWrongIds, getAnsweredIds, getAnsweredCount, getWrongCount, getSectionStats, getModuleWrongCount,
    addWrong, removeWrong, recordAnswer, clearSectionWrong, resetSection,
    getActiveSession, hasResumableSession, startSession, patchSession, recordSessionAnswer, clearSession,
  }
})
