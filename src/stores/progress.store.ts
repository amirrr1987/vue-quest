import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { makeSectionKey, type SectionKey } from '@/types/quiz.types'

export interface SectionStats {
  answered: number
  correct: number
}

export interface ProgressState {
  wrongBySection: Record<SectionKey, string[]>
  answeredIdsBySection: Record<SectionKey, string[]>
  sectionStats: Record<SectionKey, SectionStats>
}

const STORAGE_KEY = 'learn-vue-progress'

const defaultState = (): ProgressState => ({
  wrongBySection: {},
  answeredIdsBySection: {},
  sectionStats: {},
})

export const useProgressStore = defineStore('progress', () => {
  const state = useLocalStorage<ProgressState>(STORAGE_KEY, defaultState(), {
    mergeDefaults: true,
  })

  function sectionKey(moduleId: string, sectionId: string): SectionKey {
    return makeSectionKey(moduleId, sectionId)
  }

  function getWrongIds(moduleId: string, sectionId: string): string[] {
    const key = sectionKey(moduleId, sectionId)
    return state.value.wrongBySection[key] ?? []
  }

  function getAnsweredIds(moduleId: string, sectionId: string): string[] {
    const key = sectionKey(moduleId, sectionId)
    return state.value.answeredIdsBySection[key] ?? []
  }

  function getAnsweredCount(moduleId: string, sectionId: string): number {
    return getAnsweredIds(moduleId, sectionId).length
  }

  function getWrongCount(moduleId: string, sectionId: string): number {
    return getWrongIds(moduleId, sectionId).length
  }

  function getSectionStats(moduleId: string, sectionId: string): SectionStats {
    const key = sectionKey(moduleId, sectionId)
    return state.value.sectionStats[key] ?? { answered: 0, correct: 0 }
  }

  function getModuleWrongCount(moduleId: string, sectionIds: string[]): number {
    return sectionIds.reduce(
      (sum, sectionId) => sum + getWrongCount(moduleId, sectionId),
      0,
    )
  }

  function addWrong(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = state.value.wrongBySection[key] ?? []
    if (!current.includes(questionId)) {
      state.value.wrongBySection[key] = [...current, questionId]
    }
  }

  function markAnswered(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = state.value.answeredIdsBySection[key] ?? []
    if (!current.includes(questionId)) {
      state.value.answeredIdsBySection[key] = [...current, questionId]
    }
  }

  function removeWrong(moduleId: string, sectionId: string, questionId: string) {
    const key = sectionKey(moduleId, sectionId)
    const current = state.value.wrongBySection[key] ?? []
    state.value.wrongBySection[key] = current.filter((id) => id !== questionId)
  }

  function recordAnswer(
    moduleId: string,
    sectionId: string,
    questionId: string,
    isCorrect: boolean,
  ) {
    const key = sectionKey(moduleId, sectionId)
    const stats = state.value.sectionStats[key] ?? { answered: 0, correct: 0 }
    state.value.sectionStats[key] = {
      answered: stats.answered + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
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
    state.value.wrongBySection[key] = []
  }

  function resetSection(moduleId: string, sectionId: string) {
    const key = sectionKey(moduleId, sectionId)
    state.value.wrongBySection[key] = []
    state.value.answeredIdsBySection[key] = []
    delete state.value.sectionStats[key]
  }

  const wrongBySection = computed(() => state.value.wrongBySection)
  const sectionStats = computed(() => state.value.sectionStats)

  return {
    wrongBySection,
    sectionStats,
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
  }
})
