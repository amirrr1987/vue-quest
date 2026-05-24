import { computed, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { LearningLevel, Question } from '@/types/quiz.types'
import { getQuestionById, getQuestionsForSection } from '@/services/quiz-loader'
import { areAnswersCorrect } from '@/utils/quiz-validation'
import { useProgressStore } from '@/stores/progress.store'

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

export interface QuizSessionOptions {
  levelFilter?: MaybeRefOrGetter<LearningLevel | null>
  wrongOnly?: MaybeRefOrGetter<boolean>
}

export function useQuizSession(
  moduleId: MaybeRefOrGetter<string>,
  sectionId: MaybeRefOrGetter<string>,
  options: QuizSessionOptions = {},
) {
  const progressStore = useProgressStore()
  const { levelFilter, wrongOnly } = options

  const allQuestions = shallowRef<Question[]>([])
  const currentIndex = ref(0)
  const selectedIds = ref<string[]>([])
  const submitted = ref(false)
  const lastCorrect = ref<boolean | null>(null)
  const finished = ref(false)
  const sessionCorrect = ref(0)
  const sessionAnswered = ref(0)

  function resolveQuestions(): Question[] {
    const mod = toValue(moduleId)
    const sec = toValue(sectionId)
    let list: Question[]

    if (toValue(wrongOnly)) {
      list = progressStore
        .getWrongIds(mod, sec)
        .map((id) => getQuestionById(mod, id))
        .filter((q): q is Question => q !== undefined)
      list = shuffleArray(list)
    } else {
      list = [...getQuestionsForSection(mod, sec)]
    }

    const level = levelFilter ? toValue(levelFilter) : null
    if (level) {
      list = list.filter((q) => q.level === level)
    }

    return list
  }

  function loadQuestions() {
    allQuestions.value = resolveQuestions()
    resetSession()
  }

  const questions = computed(() => allQuestions.value)

  watch(
    [
      () => toValue(moduleId),
      () => toValue(sectionId),
      () => toValue(levelFilter ?? null),
      () => toValue(wrongOnly ?? false),
    ],
    loadQuestions,
    { immediate: true },
  )

  const currentQuestion = computed(
    () => questions.value[currentIndex.value] ?? null,
  )

  const total = computed(() => questions.value.length)
  const progressPercent = computed(() =>
    total.value === 0
      ? 0
      : Math.round(
          ((currentIndex.value + (submitted.value ? 1 : 0)) / total.value) * 100,
        ),
  )

  const isWrongOnlyMode = computed(() => Boolean(toValue(wrongOnly)))

  function resetSession() {
    currentIndex.value = 0
    selectedIds.value = []
    submitted.value = false
    lastCorrect.value = null
    finished.value = false
    sessionCorrect.value = 0
    sessionAnswered.value = 0
  }

  function toggleSelection(id: string, multiple: boolean) {
    if (submitted.value) return
    if (multiple) {
      const set = new Set(selectedIds.value)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      selectedIds.value = [...set]
    } else {
      selectedIds.value = [id]
    }
  }

  function submitAnswer() {
    const question = currentQuestion.value
    if (!question || selectedIds.value.length === 0) return

    const correct = areAnswersCorrect(question, selectedIds.value)
    lastCorrect.value = correct
    submitted.value = true
    sessionAnswered.value += 1
    if (correct) sessionCorrect.value += 1
    progressStore.recordAnswer(
      toValue(moduleId),
      toValue(sectionId),
      question.id,
      correct,
    )
  }

  function nextQuestion() {
    if (!submitted.value) return

    if (toValue(wrongOnly)) {
      const wasCorrect = lastCorrect.value
      allQuestions.value = resolveQuestions()
      if (allQuestions.value.length === 0) {
        finished.value = true
        return
      }
      if (!wasCorrect) {
        currentIndex.value = Math.min(
          currentIndex.value + 1,
          allQuestions.value.length - 1,
        )
      } else {
        currentIndex.value = Math.min(
          currentIndex.value,
          allQuestions.value.length - 1,
        )
      }
    } else if (currentIndex.value >= questions.value.length - 1) {
      finished.value = true
      return
    } else {
      currentIndex.value += 1
    }

    selectedIds.value = []
    submitted.value = false
    lastCorrect.value = null
  }

  function prevQuestion() {
    if (currentIndex.value <= 0 || submitted.value) return
    currentIndex.value -= 1
    selectedIds.value = []
    submitted.value = false
    lastCorrect.value = null
  }

  return {
    questions,
    currentQuestion,
    currentIndex,
    selectedIds,
    submitted,
    lastCorrect,
    finished,
    sessionCorrect,
    sessionAnswered,
    total,
    progressPercent,
    isWrongOnlyMode,
    resetSession,
    toggleSelection,
    submitAnswer,
    nextQuestion,
    prevQuestion,
  }
}
