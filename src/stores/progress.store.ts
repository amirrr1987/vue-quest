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

/**
 * کلیدهای localStorage — دو layer مستقل برای بهینه‌سازی I/O.
 * - STATS: تغییرات پراکنده، فقط هنگام recordAnswer
 * - SESSION: تغییرات مکرر، فقط هنگام جلسه فعال
 * - STATS_LEGACY: کلید قدیمی برای migration یک‌بار
 */
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

/**
 * چک می‌کند session ذخیره‌شده schema لازم را دارد. ساختار قدیمی یا ناقص
 * (مثلاً بدون فیلد queue/history) به جای throw، null برگردانده می‌شود
 * تا یک جلسه‌ی تازه ساخته شود.
 */
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
    try {
      localStorage.removeItem(STORAGE_SESSION)
    } catch {
      // ignore
    }
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

  // قبل از init useLocalStorage، session ذخیره‌شده را validate می‌کنیم.
  // داده‌ی ناقص (مثلاً از schema قدیمی) پاک می‌شود تا useLocalStorage مقدار سالم بخواند.
  const validatedInitial = readPersistedSession()

  // serializer صریح ضروری: بدون آن useLocalStorage از نوع مقدار اولیه (null)
  // برای تعیین serializer استفاده می‌کند و وقتی مقدار به object تغییر می‌کند
  // به جای JSON.stringify ، toString اعمال می‌شود → "[object Object]" در localStorage.
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

  // #region agent log
  try {
    const rawLS = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_SESSION) : 'no-localStorage'
    fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'progress.store.ts:init',message:'store init',data:{validatedInitialNull:validatedInitial===null,sessionValueNull:session.value===null,rawLSNull:rawLS===null,rawLSLen:rawLS?rawLS.length:0,sessionValueKeys:session.value?Object.keys(session.value):null,sessionHistorySize:session.value&&session.value.history?Object.keys(session.value.history).length:0,sessionCurrentIndex:session.value?.currentIndex??'null',sessionModuleId:session.value?.moduleId??'null',sessionQueueLen:session.value&&Array.isArray(session.value.queue)?session.value.queue.length:'null'},hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
  } catch {}
  // #endregion

  function sectionKey(moduleId: string, sectionId: string): SectionKey {
    return makeSectionKey(moduleId, sectionId)
  }

  function getWrongIds(moduleId: string, sectionId: string): string[] {
    const key = sectionKey(moduleId, sectionId)
    return stats.value.wrongBySection[key] ?? []
  }

  function getAnsweredIds(moduleId: string, sectionId: string): string[] {
    const key = sectionKey(moduleId, sectionId)
    return stats.value.answeredIdsBySection[key] ?? []
  }

  function getAnsweredCount(moduleId: string, sectionId: string): number {
    return getAnsweredIds(moduleId, sectionId).length
  }

  function getWrongCount(moduleId: string, sectionId: string): number {
    return getWrongIds(moduleId, sectionId).length
  }

  function getSectionStats(moduleId: string, sectionId: string): SectionStats {
    const key = sectionKey(moduleId, sectionId)
    return stats.value.sectionStats[key] ?? { answered: 0, correct: 0 }
  }

  function getModuleWrongCount(moduleId: string, sectionIds: string[]): number {
    return sectionIds.reduce(
      (sum, sectionId) => sum + getWrongCount(moduleId, sectionId),
      0,
    )
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

    if (isCorrect) {
      removeWrong(moduleId, sectionId, questionId)
    } else {
      addWrong(moduleId, sectionId, questionId)
    }
  }

  function clearSectionWrong(moduleId: string, sectionId: string) {
    const key = sectionKey(moduleId, sectionId)
    stats.value.wrongBySection[key] = []
  }

  function resetSection(moduleId: string, sectionId: string) {
    const key = sectionKey(moduleId, sectionId)
    stats.value.wrongBySection[key] = []
    stats.value.answeredIdsBySection[key] = []
    delete stats.value.sectionStats[key]
    if (
      session.value?.moduleId === moduleId &&
      session.value?.sectionId === sectionId
    ) {
      session.value = null
    }
  }

  function getActiveSession(): ActiveSession | null {
    return session.value
  }

  function hasResumableSession(
    moduleId: string,
    sectionId: string,
    mode: ActiveSession['mode'],
  ): boolean {
    const s = session.value
    return Boolean(
      s &&
        Array.isArray(s.queue) &&
        s.moduleId === moduleId &&
        s.sectionId === sectionId &&
        s.mode === mode &&
        s.queue.length > 0,
    )
  }

  function startSession(initial: Omit<ActiveSession, 'startedAt' | 'updatedAt'>) {
    const now = Date.now()
    // #region agent log
    fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'progress.store.ts:startSession',message:'startSession called (RESETS history)',data:{moduleId:initial.moduleId,sectionId:initial.sectionId,mode:initial.mode,level:initial.level,queueLen:initial.queue.length,historyLen:Object.keys(initial.history).length,priorSessionExists:session.value!==null,priorHistoryLen:session.value?Object.keys(session.value.history).length:0},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    session.value = { ...initial, startedAt: now, updatedAt: now }
  }

  function patchSession(patch: Partial<ActiveSession>) {
    if (!session.value) return
    session.value = {
      ...session.value,
      ...patch,
      updatedAt: Date.now(),
    }
  }

  function recordSessionAnswer(questionId: string, answer: SessionAnswer) {
    if (!session.value) return
    const newHistory = { ...session.value.history, [questionId]: answer }
    // #region agent log
    fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'progress.store.ts:recordSessionAnswer',message:'answer recorded to session.history',data:{questionId,correct:answer.correct,selectedCount:answer.selectedIds.length,historySize:Object.keys(newHistory).length},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    session.value = {
      ...session.value,
      history: newHistory,
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
    wrongBySection,
    sectionStats,
    activeSession,
    getWrongIds,
    getAnsweredIds,
    getAnsweredCount,
    getWrongCount,
    getSectionStats,
    getModuleWrongCount,
    addWrong,
    removeWrong,
    recordAnswer,
    clearSectionWrong,
    resetSection,
    getActiveSession,
    hasResumableSession,
    startSession,
    patchSession,
    recordSessionAnswer,
    clearSession,
  }
})
