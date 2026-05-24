import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { QuizModule } from '@/types/quiz.types'
import { useProgressStore } from '@/stores/progress.store'
import { makeSectionKey } from '@/types/quiz.types'

export function useSectionProgress(
  moduleId: MaybeRefOrGetter<string>,
  sectionId: MaybeRefOrGetter<string>,
  totalQuestions: MaybeRefOrGetter<number>,
) {
  const progressStore = useProgressStore()

  return computed(() => {
    const total = toValue(totalQuestions)
    const answered = progressStore.getAnsweredCount(
      toValue(moduleId),
      toValue(sectionId),
    )
    const stats = progressStore.getSectionStats(
      toValue(moduleId),
      toValue(sectionId),
    )

    return {
      total,
      answered,
      percent: total === 0 ? 0 : Math.round((answered / total) * 100),
      attempts: stats.answered,
      correct: stats.correct,
      accuracy:
        stats.answered === 0
          ? 0
          : Math.round((stats.correct / stats.answered) * 100),
      wrongCount: progressStore.getWrongCount(
        toValue(moduleId),
        toValue(sectionId),
      ),
    }
  })
}

export function useModuleProgress(module: MaybeRefOrGetter<QuizModule | undefined>) {
  const progressStore = useProgressStore()

  return computed(() => {
    const mod = toValue(module)
    if (!mod) {
      return {
        totalQuestions: 0,
        answered: 0,
        percent: 0,
        wrongCount: 0,
      }
    }

    let totalQuestions = 0
    let answered = 0

    for (const section of mod.sections) {
      totalQuestions += section.questions.length
      answered += progressStore.getAnsweredCount(mod.id, section.id)
    }

    return {
      totalQuestions,
      answered,
      percent:
        totalQuestions === 0
          ? 0
          : Math.round((answered / totalQuestions) * 100),
      wrongCount: progressStore.getModuleWrongCount(
        mod.id,
        mod.sections.map((s) => s.id),
      ),
    }
  })
}

export function sectionKey(moduleId: string, sectionId: string) {
  return makeSectionKey(moduleId, sectionId)
}
