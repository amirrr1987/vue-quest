import {
  computed,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  ActiveSession,
  LearningLevel,
  Question,
  QuizMode,
  SessionAnswer,
} from '@/types/quiz.types'
import {
  getQuestionById,
  getQuestionsForSection,
} from '@/services/quiz-loader'
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
  shuffleNormal?: MaybeRefOrGetter<boolean>
}

export function useQuizSession(
  moduleId: MaybeRefOrGetter<string>,
  sectionId: MaybeRefOrGetter<string>,
  options: QuizSessionOptions = {},
) {
  const progressStore = useProgressStore()
  const { levelFilter, wrongOnly, shuffleNormal } = options

  const allQuestions = shallowRef<Question[]>([])
  const currentIndex = ref(0)
  const selectedIds = ref<string[]>([])
  const submitted = ref(false)
  const lastCorrect = ref<boolean | null>(null)
  const finished = ref(false)
  const resumed = ref(false)
  /** جهت انیمیشن: 1 = جلو، -1 = عقب */
  const navDirection = ref<1 | -1>(1)

  function currentMode(): QuizMode {
    return toValue(wrongOnly) ? 'wrong' : 'normal'
  }

  function buildQueue(): string[] {
    const mod = toValue(moduleId)
    const sec = toValue(sectionId)
    const mode = currentMode()
    const level = levelFilter ? toValue(levelFilter) : null

    let list: Question[]
    if (mode === 'wrong') {
      list = progressStore
        .getWrongIds(mod, sec)
        .map((id) => getQuestionById(mod, id))
        .filter((q): q is Question => q !== undefined)
      list = shuffleArray(list)
    } else {
      list = [...getQuestionsForSection(mod, sec)]
      if (toValue(shuffleNormal)) list = shuffleArray(list)
    }
    if (level) list = list.filter((q) => q.level === level)
    return list.map((q) => q.id)
  }

  function resolveQuestionsFromQueue(queue: string[]): Question[] {
    const mod = toValue(moduleId)
    return queue
      .map((id) => getQuestionById(mod, id))
      .filter((q): q is Question => q !== undefined)
  }

  function loadOrResume(forceNew = false) {
    const mod = toValue(moduleId)
    const sec = toValue(sectionId)
    const mode = currentMode()
    const level = levelFilter ? toValue(levelFilter) : null
    const existing = progressStore.getActiveSession()

    const canResume =
      !forceNew &&
      existing !== null &&
      existing.moduleId === mod &&
      existing.sectionId === sec &&
      existing.mode === mode &&
      Array.isArray(existing.queue) &&
      existing.history !== null &&
      typeof existing.history === 'object'

    if (canResume) {
      const newQueue = buildQueue()
      const oldQueue = existing!.queue
      const queueChanged =
        newQueue.length !== oldQueue.length ||
        newQueue.some((id, i) => id !== oldQueue[i])

      let newCurrentIndex = existing!.currentIndex
      if (queueChanged) {
        const firstUnanswered = newQueue.findIndex((id) => !existing!.history[id])
        newCurrentIndex = firstUnanswered === -1 ? 0 : firstUnanswered
      }

      progressStore.patchSession({ queue: newQueue, currentIndex: newCurrentIndex, level })
      applySession(progressStore.getActiveSession()!)
      resumed.value = true
      return
    }

    const queue = buildQueue()
    progressStore.startSession({
      moduleId: mod, sectionId: sec, mode, level,
      queue, currentIndex: 0, history: {},
    })
    applySession(progressStore.getActiveSession()!)
    resumed.value = false
  }

  function applySession(sess: ActiveSession) {
    allQuestions.value = resolveQuestionsFromQueue(sess.queue)
    if (allQuestions.value.length === 0) {
      currentIndex.value = 0
      selectedIds.value = []
      submitted.value = false
      lastCorrect.value = null
      finished.value = false
      return
    }
    const idx = Math.min(sess.currentIndex, allQuestions.value.length - 1)
    currentIndex.value = Math.max(0, idx)
    const qid = allQuestions.value[currentIndex.value]?.id
    const prior = qid ? sess.history[qid] : undefined
    if (prior) {
      selectedIds.value = [...prior.selectedIds]
      submitted.value = true
      lastCorrect.value = prior.correct
    } else {
      selectedIds.value = []
      submitted.value = false
      lastCorrect.value = null
    }
    finished.value = false
  }

  const questions = computed(() => allQuestions.value)

  watch(
    [
      () => toValue(moduleId),
      () => toValue(sectionId),
      () => toValue(levelFilter ?? null),
      () => toValue(wrongOnly ?? false),
    ],
    () => loadOrResume(false),
    { immediate: true },
  )

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const total = computed(() => questions.value.length)

  const answeredInSession = computed(() => {
    const sess = progressStore.getActiveSession()
    return sess ? Object.keys(sess.history).length : 0
  })

  const sessionCorrect = computed(() => {
    const sess = progressStore.getActiveSession()
    if (!sess) return 0
    let n = 0
    for (const a of Object.values(sess.history)) if (a.correct) n += 1
    return n
  })

  const sessionAnswered = answeredInSession

  const progressPercent = computed(() =>
    total.value === 0 ? 0 : Math.round((answeredInSession.value / total.value) * 100),
  )

  const questionStatuses = computed(() => {
    const sess = progressStore.getActiveSession()
    return questions.value.map((q, i) => {
      const a = sess?.history[q.id]
      if (a) return a.correct ? 'correct' : 'wrong'
      if (i === currentIndex.value) return 'current'
      return 'pending'
    })
  })

  const isWrongOnlyMode = computed(() => Boolean(toValue(wrongOnly)))

  const isReviewing = computed(() => {
    const sess = progressStore.getActiveSession()
    const q = currentQuestion.value
    return Boolean(q && sess?.history[q.id])
  })

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
    if (!question || selectedIds.value.length === 0 || submitted.value) return

    const correct = areAnswersCorrect(question, selectedIds.value)
    lastCorrect.value = correct
    submitted.value = true

    const answer: SessionAnswer = { selectedIds: [...selectedIds.value], correct }
    progressStore.recordSessionAnswer(question.id, answer)
    progressStore.recordAnswer(toValue(moduleId), toValue(sectionId), question.id, correct)
  }

  function jumpTo(index: number) {
    if (index < 0 || index >= questions.value.length) return
    navDirection.value = index > currentIndex.value ? 1 : -1
    const sess = progressStore.getActiveSession()
    progressStore.patchSession({ currentIndex: index })
    currentIndex.value = index
    const q = questions.value[index]
    const prior = q ? sess?.history[q.id] : undefined
    if (prior) {
      selectedIds.value = [...prior.selectedIds]
      submitted.value = true
      lastCorrect.value = prior.correct
    } else {
      selectedIds.value = []
      submitted.value = false
      lastCorrect.value = null
    }
  }

  function nextQuestion() {
    if (!submitted.value) return
    if (currentMode() === 'wrong') {
      const remaining = buildQueue()
      if (remaining.length === 0) {
        finished.value = true
        progressStore.clearSession()
        return
      }
      const sess = progressStore.getActiveSession()
      progressStore.patchSession({ queue: remaining, currentIndex: 0, history: sess?.history ?? {} })
      allQuestions.value = resolveQuestionsFromQueue(remaining)
      navDirection.value = 1
      currentIndex.value = 0
      selectedIds.value = []
      submitted.value = false
      lastCorrect.value = null
      return
    }
    if (currentIndex.value >= questions.value.length - 1) {
      finished.value = true
      progressStore.clearSession()
      return
    }
    jumpTo(currentIndex.value + 1)
  }

  function prevQuestion() {
    if (currentIndex.value <= 0) return
    jumpTo(currentIndex.value - 1)
  }

  function restartSession() {
    progressStore.clearSession()
    finished.value = false
    loadOrResume(true)
  }

  return {
    questions, currentQuestion, currentIndex, selectedIds, submitted, lastCorrect,
    finished, resumed, sessionCorrect, sessionAnswered, total, progressPercent,
    isWrongOnlyMode, isReviewing, questionStatuses, navDirection,
    toggleSelection, submitAnswer, nextQuestion, prevQuestion, jumpTo, restartSession,
  }
}
