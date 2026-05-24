<template>
  <template v-if="module && section">
    <AppPage :max-width="820">
      <QuizPageHeader
        :title="pageTitle"
        :sub-title="pageSubTitle"
        :module-id="module.id"
        @back="goBack"
      />

      <Alert
        v-if="isWrongQuiz && total > 0"
        type="warning"
        show-icon
        :message="t('wrongQuizBanner')"
        :description="t('wrongQuizHint', { count: total })"
      />

      <LevelFilter v-if="!isWrongQuiz" v-model:level="levelFilter" />

      <Card v-if="total > 0 && !finished" :bordered="false">
        <Flex vertical gap="large">
          <QuizProgress :percent="progressPercent" :label="progressLabel" />

          <QuestionRenderer
            v-if="currentQuestion"
            :question="currentQuestion"
            :selected-ids="selectedIds"
            :disabled="submitted"
            @update:selected-ids="selectedIds = $event"
          />

          <Alert
            v-if="submitted"
            :type="lastCorrect ? 'success' : 'error'"
            :message="lastCorrect ? t('correct') : t('incorrect')"
            :description="currentQuestion?.explanation"
            show-icon
          />

          <Divider :style="{ margin: 0 }" />

          <QuizActions
            :submitted="submitted"
            :finished="finished"
            :can-submit="selectedIds.length > 0 && !submitted"
            :can-prev="currentIndex > 0 && !submitted"
            @prev="prevQuestion"
            @submit="submitAnswer"
            @next="nextQuestion"
            @finish="goBack"
          />
        </Flex>
      </Card>

      <Result
        v-else-if="finished"
        status="success"
        :title="isWrongQuiz ? t('wrongQuizComplete') : t('quizComplete')"
        :sub-title="resultSubTitle"
      >
        <template #extra>
          <Space>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Result,
  Space,
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
const levelFilter = ref<LearningLevel | null>(null)

const module = computed(() => getQuizModule(resolvedModuleId.value))
const section = computed(() =>
  getSection(resolvedModuleId.value, resolvedSectionId.value),
)

const progressStore = useProgressStore()

const {
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
  submitAnswer,
  nextQuestion,
  prevQuestion,
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

function goBack() {
  router.push({
    name: RouteEnum.ModuleDetail,
    params: { moduleId: resolvedModuleId.value },
  })
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
</script>
