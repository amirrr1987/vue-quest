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
  /** اگر true باشد، در normal mode سوالات shuffle می‌شوند */
  shuffleNormal?: MaybeRefOrGetter<boolean>
}

/**
 * مدیریت جلسه آزمون با قابلیت resume خودکار از localStorage.
 *
 * منطق:
 *  - resolveQuestions بر اساس mode/level لیست id بسازد.
 *  - اگر session فعالی برای همین mode/section وجود داشت، queue همان session
 *    استفاده می‌شود تا کاربر دقیقاً از همان‌جا که قطع کرده ادامه دهد.
 *  - history همان session پر می‌شود تا navigation بین سوالات بدون از دست رفتن
 *    پاسخ ممکن باشد.
 */
export function useQuizSession(
  moduleId: MaybeRefOrGetter<string>,
  sectionId: MaybeRefOrGetter<string>,
  options: QuizSessionOptions = {},
) {
  const progressStore = useProgressStore()
  const { levelFilter, wrongOnly, shuffleNormal } = options

  /** فهرست کامل سوالات ترتیب‌داده‌شده در این جلسه (resolve از queue + loader) */
  const allQuestions = shallowRef<Question[]>([])
  const currentIndex = ref(0)
  const selectedIds = ref<string[]>([])
  const submitted = ref(false)
  const lastCorrect = ref<boolean | null>(null)
  const finished = ref(false)
  /** آیا جلسه اولیه از localStorage resume شده */
  const resumed = ref(false)

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
      if (toValue(shuffleNormal)) {
        list = shuffleArray(list)
      }
    }

    if (level) {
      list = list.filter((q) => q.level === level)
    }
    return list.map((q) => q.id)
  }

  function resolveQuestionsFromQueue(queue: string[]): Question[] {
    const mod = toValue(moduleId)
    return queue
      .map((id) => getQuestionById(mod, id))
      .filter((q): q is Question => q !== undefined)
  }

  /**
   * بارگذاری جلسه؛ یا resume از localStorage یا ساختن جلسه جدید.
   *
   * منطق کلیدی برای **حفظ پاسخ‌ها**:
   *  - مطابقت session فقط با moduleId/sectionId/mode سنجیده می‌شود
   *    (نه level)؛ تغییر فیلتر سطح، queue را rebuild می‌کند اما history
   *    دست‌نخورده می‌ماند. این یعنی پاسخ‌های قبلی هرگز با کلیک روی LevelFilter
   *    یا refresh پاک نمی‌شوند.
   */
  function loadOrResume(forceNew = false) {
    const mod = toValue(moduleId)
    const sec = toValue(sectionId)
    const mode = currentMode()
    const level = levelFilter ? toValue(levelFilter) : null

    const existing = progressStore.getActiveSession()

    const conditions = {
      notForceNew: !forceNew,
      existingNotNull: existing !== null,
      moduleMatch: existing?.moduleId === mod,
      sectionMatch: existing?.sectionId === sec,
      modeMatch: existing?.mode === mode,
      queueIsArray: existing ? Array.isArray(existing.queue) : false,
      historyNotNull: existing ? existing.history !== null : false,
      historyIsObject: existing ? typeof existing.history === 'object' : false,
    }

    const canResume =
      conditions.notForceNew &&
      conditions.existingNotNull &&
      conditions.moduleMatch &&
      conditions.sectionMatch &&
      conditions.modeMatch &&
      conditions.queueIsArray &&
      conditions.historyNotNull &&
      conditions.historyIsObject

    // #region agent log
    try {
      fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'useQuizSession.ts:loadOrResume',message:'canResume decision',data:{forceNew,mod,sec,mode,level,canResume,...conditions,existingModuleId:existing?.moduleId,existingSectionId:existing?.sectionId,existingMode:existing?.mode,existingQueueLen:existing&&Array.isArray(existing.queue)?existing.queue.length:'n/a',existingHistoryLen:existing&&existing.history?Object.keys(existing.history).length:'n/a',existingCurrentIndex:existing?.currentIndex},hypothesisId:'A-D',timestamp:Date.now()})}).catch(()=>{});
    } catch {}
    // #endregion

    if (canResume) {
      const newQueue = buildQueue()
      const oldQueue = existing!.queue
      const queueChanged =
        newQueue.length !== oldQueue.length ||
        newQueue.some((id, i) => id !== oldQueue[i])

      let newCurrentIndex = existing!.currentIndex
      if (queueChanged) {
        // اولین سوال پاسخ‌نداده‌شده در queue جدید را پیدا کن
        const firstUnanswered = newQueue.findIndex(
          (id) => !existing!.history[id],
        )
        newCurrentIndex = firstUnanswered === -1 ? 0 : firstUnanswered
      }

      progressStore.patchSession({
        queue: newQueue,
        currentIndex: newCurrentIndex,
        level,
      })

      // #region agent log
      fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'useQuizSession.ts:loadOrResume',message:'RESUMED session, history preserved',data:{queueChanged,oldQueueLen:oldQueue.length,newQueueLen:newQueue.length,newCurrentIndex,historySize:Object.keys(existing!.history).length},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      applySession(progressStore.getActiveSession()!)
      resumed.value = true
      return
    }

    const queue = buildQueue()
    progressStore.startSession({
      moduleId: mod,
      sectionId: sec,
      mode,
      level,
      queue,
      currentIndex: 0,
      history: {},
    })

    // #region agent log
    fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'useQuizSession.ts:loadOrResume',message:'STARTED NEW session (history reset)',data:{reason:forceNew?'forceNew':existing?'mismatch':'no-existing',queueLen:queue.length},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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

  // در تغییر route/mode/level جلسه را بازیابی یا تازه می‌سازیم.
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

  const currentQuestion = computed(
    () => questions.value[currentIndex.value] ?? null,
  )

  const total = computed(() => questions.value.length)

  /** تعداد سوالاتی که در همین جلسه پاسخ داده شده‌اند */
  const answeredInSession = computed(() => {
    const sess = progressStore.getActiveSession()
    if (!sess) return 0
    return Object.keys(sess.history).length
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
    total.value === 0
      ? 0
      : Math.round((answeredInSession.value / total.value) * 100),
  )

  /** نمای کلی پیشرفت — برای dots progress */
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

  /** اگر سوال فعلی قبلاً در همین جلسه پاسخ داده شده، حالت review است */
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
    if (!question || selectedIds.value.length === 0) return
    if (submitted.value) return

    const correct = areAnswersCorrect(question, selectedIds.value)
    lastCorrect.value = correct
    submitted.value = true

    const answer: SessionAnswer = {
      selectedIds: [...selectedIds.value],
      correct,
    }
    progressStore.recordSessionAnswer(question.id, answer)
    progressStore.recordAnswer(
      toValue(moduleId),
      toValue(sectionId),
      question.id,
      correct,
    )

    // #region agent log
    try {
      const rawAfter = typeof localStorage !== 'undefined' ? localStorage.getItem('vq:session') : null
      const parsed = rawAfter ? JSON.parse(rawAfter) : null
      fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'useQuizSession.ts:submitAnswer',message:'after submit, check localStorage',data:{questionId:question.id,correct,currentIndex:currentIndex.value,rawAfterNull:rawAfter===null,parsedHistoryLen:parsed&&parsed.history?Object.keys(parsed.history).length:0,parsedCurrentIndex:parsed?.currentIndex},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    } catch {}
    // #endregion
  }

  function jumpTo(index: number) {
    if (index < 0 || index >= questions.value.length) return
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

    // #region agent log
    try {
      const rawBefore = typeof localStorage !== 'undefined' ? localStorage.getItem('vq:session') : null
      const p = rawBefore ? JSON.parse(rawBefore) : null
      fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'useQuizSession.ts:nextQuestion',message:'before next',data:{currentIndex:currentIndex.value,lsCurrentIndex:p?.currentIndex,lsHistoryLen:p&&p.history?Object.keys(p.history).length:0},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    } catch {}
    // #endregion

    if (currentMode() === 'wrong') {
      // در حالت اشتباهات، queue را بر اساس وضعیت فعلی wrong rebuild می‌کنیم.
      const remaining = buildQueue()
      if (remaining.length === 0) {
        finished.value = true
        progressStore.clearSession()
        return
      }
      const sess = progressStore.getActiveSession()
      progressStore.patchSession({
        queue: remaining,
        currentIndex: 0,
        history: sess?.history ?? {},
      })
      allQuestions.value = resolveQuestionsFromQueue(remaining)
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
    questions,
    currentQuestion,
    currentIndex,
    selectedIds,
    submitted,
    lastCorrect,
    finished,
    resumed,
    sessionCorrect,
    sessionAnswered,
    total,
    progressPercent,
    isWrongOnlyMode,
    isReviewing,
    questionStatuses,
    toggleSelection,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    jumpTo,
    restartSession,
  }
}
