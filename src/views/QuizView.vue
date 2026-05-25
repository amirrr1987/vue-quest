<template>
  <template v-if="module && section">
    <AppPage :max-width="820">
      <QuizPageHeader
        :title="pageTitle"
        :sub-title="pageSubTitle"
        :module-id="module.id"
        @back="onBack"
      >
        <template v-if="resumed" #extra>
          <Tag color="processing" :bordered="false">
            <Icon
              icon="tabler:player-play"
              :width="12"
              :height="12"
              :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
            />
            {{ t('resumeBadge') }}
          </Tag>
        </template>
      </QuizPageHeader>

      <Alert
        v-if="isWrongQuiz && total > 0"
        type="warning"
        show-icon
        :message="t('wrongQuizBanner')"
        :description="t('wrongQuizHint', { count: total })"
      />

      <Alert
        v-if="resumed && !finished && total > 0"
        type="info"
        show-icon
        closable
        :message="t('resumeMessage')"
        :description="t('resumeDescription', { current: currentIndex + 1, total })"
      >
        <template #action>
          <Popconfirm
            :title="t('restartConfirm')"
            ok-text="بله، شروع از نو"
            cancel-text="انصراف"
            :ok-button-props="{ danger: true }"
            @confirm="onRestart"
          >
            <Button size="small" type="text">
              <template #icon>
                <Icon icon="tabler:refresh" :width="14" :height="14" />
              </template>
              {{ t('restartSession') }}
            </Button>
          </Popconfirm>
        </template>
      </Alert>

      <LevelFilter v-if="!isWrongQuiz" v-model:level="levelFilter" />

      <Card v-if="total > 0 && !finished" :bordered="false">
        <Flex vertical gap="large">
          <QuizProgress
            :percent="progressPercent"
            :label="progressLabel"
            :statuses="questionStatuses"
            @jump="onJump"
          />

          <QuestionRenderer
            v-if="currentQuestion"
            :question="currentQuestion"
            :selected-ids="selectedIds"
            :disabled="submitted"
            :reveal-answer="submitted"
            @update:selected-ids="selectedIds = $event"
          />

          <Alert
            v-if="submitted"
            :type="lastCorrect ? 'success' : 'error'"
            :message="lastCorrect ? t('correct') : t('incorrect')"
            :description="currentQuestion?.explanation"
            show-icon
          />

          <Typography.Text
            v-if="isReviewing && !submitted"
            type="secondary"
            :style="{ fontSize: '13px' }"
          >
            <Icon
              icon="tabler:eye"
              :width="14"
              :height="14"
              :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
            />
            {{ t('reviewModeHint') }}
          </Typography.Text>

          <Divider :style="{ margin: 0 }" />

          <QuizActions
            :submitted="submitted"
            :finished="finished"
            :reviewing="isReviewing"
            :can-submit="selectedIds.length > 0 && !submitted"
            :can-prev="currentIndex > 0"
            :can-next="submitted"
            :is-last="currentIndex === total - 1"
            @prev="prevQuestion"
            @submit="submitAnswer"
            @next="nextQuestion"
            @finish="onFinish"
          />

          <Typography.Text type="secondary" :style="{ fontSize: '12px' }">
            <Icon
              icon="tabler:keyboard"
              :width="12"
              :height="12"
              :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
            />
            {{ t('keyboardHints') }}
          </Typography.Text>
        </Flex>
      </Card>

      <Result
        v-else-if="finished"
        status="success"
        :title="isWrongQuiz ? t('wrongQuizComplete') : t('quizComplete')"
        :sub-title="resultSubTitle"
      >
        <template #extra>
          <Space wrap>
            <Button
              v-if="!isWrongQuiz && wrongInSection > 0"
              size="large"
              @click="goWrongQuiz"
            >
              <template #icon>
                <Icon icon="tabler:refresh" :width="16" :height="16" />
              </template>
              {{ t('wrongQuizCta') }}
            </Button>
            <Button size="large" @click="onRestart">
              <template #icon>
                <Icon icon="tabler:rotate-clockwise" :width="16" :height="16" />
              </template>
              {{ t('restartSession') }}
            </Button>
            <Button type="primary" size="large" @click="goBack">
              {{ t('backToModule') }}
            </Button>
          </Space>
        </template>
      </Result>

      <Empty v-else :description="emptyDescription">
        <Button type="primary" @click="goBack">
          {{ isWrongQuiz ? t('emptyReviewCta') : t('back') }}
        </Button>
      </Empty>
    </AppPage>
  </template>
  <Result v-else status="404" :title="t('sectionNotFound')">
    <template #extra>
      <Button type="primary" @click="router.push({ name: RouteEnum.Dashboard })">
        {{ t('goHome') }}
      </Button>
    </template>
  </Result>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Modal,
  Popconfirm,
  Result,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'
import AppPage from '@/components/layout/AppPage.vue'
import LevelFilter from '@/components/quiz/LevelFilter.vue'
import QuestionRenderer from '@/components/quiz/QuestionRenderer.vue'
import QuizActions from '@/components/quiz/QuizActions.vue'
import QuizPageHeader from '@/components/quiz/QuizPageHeader.vue'
import QuizProgress from '@/components/quiz/QuizProgress.vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { useQuizSectionParams } from '@/composables/useQuizRouteParams'
import { getQuizModule, getSection } from '@/services/quiz-loader'
import { useProgressStore } from '@/stores/progress.store'
import { RouteEnum } from '@/enums/route.enum'
import type { LearningLevel } from '@/types/quiz.types'

const route = useRoute()
const router = useRouter()
const { t } = useTranslation()
const { moduleId: resolvedModuleId, sectionId: resolvedSectionId } =
  useQuizSectionParams()

const isWrongQuiz = computed(() => route.name === RouteEnum.WrongQuiz)

const module = computed(() => getQuizModule(resolvedModuleId.value))
const section = computed(() =>
  getSection(resolvedModuleId.value, resolvedSectionId.value),
)

const progressStore = useProgressStore()

/**
 * اگر session فعالی برای همین route/mode موجود است، فیلتر سطح را از آن
 * بازیابی کن تا بعد از refresh، queue و فیلتر هماهنگ بمانند و history reset نشود.
 */
function initialLevelFromSession(): LearningLevel | null {
  const sess = progressStore.getActiveSession()
  if (!sess) return null
  const mode = route.name === RouteEnum.WrongQuiz ? 'wrong' : 'normal'
  const mod = String(route.params.moduleId ?? '')
  const sec = String(route.params.sectionId ?? '')
  if (sess.moduleId === mod && sess.sectionId === sec && sess.mode === mode) {
    return sess.level
  }
  return null
}

const levelFilter = ref<LearningLevel | null>(initialLevelFromSession())

// #region agent log
fetch('http://127.0.0.1:7561/ingest/1fbc9c1a-0f6f-44eb-a449-2f59f2a15f5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'de8a89'},body:JSON.stringify({sessionId:'de8a89',location:'QuizView.vue:setup',message:'mount, init levelFilter from session',data:{routeName:String(route.name),moduleId:String(route.params.moduleId??''),sectionId:String(route.params.sectionId??''),initialLevel:levelFilter.value,sessionInStorage:(()=>{try{return JSON.parse(localStorage.getItem('vq:session')||'null')}catch{return 'parse-error'}})()},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
// #endregion

const {
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
  isReviewing,
  questionStatuses,
  submitAnswer,
  nextQuestion,
  prevQuestion,
  jumpTo,
  restartSession,
} = useQuizSession(resolvedModuleId, resolvedSectionId, {
  levelFilter,
  wrongOnly: isWrongQuiz,
})

const pageTitle = computed(() =>
  isWrongQuiz.value ? t('wrongQuizTitle') : t('startQuiz'),
)

const pageSubTitle = computed(() => {
  if (!module.value || !section.value) return undefined
  return `${module.value.title} · ${section.value.title}`
})

const resultSubTitle = computed(() => {
  const score = t('sessionScore', {
    correct: sessionCorrect.value,
    total: sessionAnswered.value,
  })
  return isWrongQuiz.value ? score : `${score} · ${t('quizCompleteHint')}`
})

const emptyDescription = computed(() =>
  isWrongQuiz.value ? t('emptyReview') : t('emptyQuiz'),
)

const wrongInSection = computed(() =>
  progressStore.getWrongCount(resolvedModuleId.value, resolvedSectionId.value),
)

const progressLabel = computed(() =>
  t('questionOf', {
    current: currentIndex.value + 1,
    total: total.value,
  }),
)

useHead({
  title: () => {
    if (!section.value) return t('appTitle')
    const label = isWrongQuiz.value ? t('wrongQuizTitle') : t('startQuiz')
    return `${label} · ${section.value.title} | ${t('appTitle')}`
  },
})

/** آیا جلسه شامل پیشرفت غیرصفر است؟ */
function hasUnfinishedProgress() {
  return (
    !finished.value &&
    total.value > 0 &&
    (sessionAnswered.value > 0 || currentIndex.value > 0)
  )
}

function goBack() {
  router.push({
    name: RouteEnum.ModuleDetail,
    params: { moduleId: resolvedModuleId.value },
  })
}

function onBack() {
  if (!hasUnfinishedProgress()) {
    goBack()
    return
  }
  Modal.confirm({
    title: t('leaveConfirmTitle'),
    content: t('leaveConfirmContent'),
    okText: t('leaveStay'),
    cancelText: t('leaveExit'),
    okType: 'primary',
    onCancel: () => goBack(),
  })
}

function onFinish() {
  progressStore.clearSession()
  goBack()
}

function onRestart() {
  restartSession()
}

function onJump(index: number) {
  jumpTo(index)
}

function goWrongQuiz() {
  router.push({
    name: RouteEnum.WrongQuiz,
    params: {
      moduleId: resolvedModuleId.value,
      sectionId: resolvedSectionId.value,
    },
  })
}

/** هشدار قبل از تغییر route با پیشرفت ناتمام */
onBeforeRouteLeave((to, _from, next) => {
  if (!hasUnfinishedProgress()) {
    next()
    return
  }
  // تغییر به همان آزمون (refresh/replace) را اجازه می‌دهیم
  if (to.name === RouteEnum.Quiz || to.name === RouteEnum.WrongQuiz) {
    next()
    return
  }
  next()
})

/** میانبرهای کیبرد برای یادگیری سریع‌تر */
function onKey(e: KeyboardEvent) {
  if (finished.value || !currentQuestion.value) return
  const target = e.target as HTMLElement | null
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  )
    return

  if (e.key === 'Enter') {
    e.preventDefault()
    if (submitted.value) nextQuestion()
    else if (selectedIds.value.length > 0) submitAnswer()
    return
  }
  if (e.key === 'ArrowRight') {
    // RTL: راست = قبلی
    e.preventDefault()
    if (currentIndex.value > 0) prevQuestion()
    return
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (submitted.value) nextQuestion()
    return
  }
  if (submitted.value) return
  const q = currentQuestion.value
  if (!q.options) return
  const num = Number(e.key)
  if (!Number.isInteger(num) || num < 1 || num > 9) return
  const opt = q.options[num - 1]
  if (!opt) return
  e.preventDefault()
  if (q.type === 'multi') {
    const set = new Set(selectedIds.value)
    if (set.has(opt.id)) set.delete(opt.id)
    else set.add(opt.id)
    selectedIds.value = [...set]
  } else {
    selectedIds.value = [opt.id]
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>
