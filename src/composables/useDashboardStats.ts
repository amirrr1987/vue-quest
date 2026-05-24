import { computed } from 'vue'
import { getAllQuizModules } from '@/services/quiz-loader'
import { useProgressStore } from '@/stores/progress.store'

export function useDashboardStats() {
  const progressStore = useProgressStore()
  const modules = getAllQuizModules()

  return computed(() => {
    let totalQuestions = 0
    let answered = 0
    let wrongCount = 0

    for (const mod of modules) {
      for (const section of mod.sections) {
        totalQuestions += section.questions.length
        answered += progressStore.getAnsweredCount(mod.id, section.id)
        wrongCount += progressStore.getWrongCount(mod.id, section.id)
      }
    }

    const percent =
      totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100)

    return {
      moduleCount: modules.length,
      totalQuestions,
      answered,
      percent,
      wrongCount,
    }
  })
}
