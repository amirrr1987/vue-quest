<template>
  <template v-if="module">
    <AppPage>
      <QuizPageHeader
        :title="module.title"
        :sub-title="module.description"
        :module-id="module.id"
        @back="router.push({ name: RouteEnum.Dashboard })"
      >
        <template #extra>
          <Tag v-if="moduleProgress.wrongCount > 0" color="error" :bordered="false">
            {{ t('wrongCount', { count: moduleProgress.wrongCount }) }}
          </Tag>
        </template>
      </QuizPageHeader>

      <Card :bordered="false" :body-style="{ padding: '20px 24px' }" ref="statsRef">
        <Row :gutter="[24, 16]" align="middle">
          <Col :xs="24" :md="12">
            <Flex vertical gap="8px">
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary">{{ t('progress') }}</Typography.Text>
                <Typography.Text strong>{{ moduleProgress.percent }}%</Typography.Text>
              </Flex>
              <Progress
                :percent="moduleProgress.percent"
                :show-info="false"
                :stroke-color="moduleProgress.percent === 100 ? '#52c41a' : '#1677ff'"
              />
            </Flex>
          </Col>
          <Col :xs="12" :md="6">
            <Statistic :title="t('totalQuestions')" :value="moduleProgress.totalQuestions" />
          </Col>
          <Col :xs="12" :md="6">
            <Statistic
              :title="t('needsReview')"
              :value="moduleProgress.wrongCount"
              :value-style="moduleProgress.wrongCount > 0 ? { color: '#ff4d4f' } : undefined"
            />
          </Col>
        </Row>
      </Card>

      <Flex vertical gap="2px">
        <Typography.Title :level="4">{{ t('sections') }}</Typography.Title>
        <Typography.Text type="secondary">{{ t('sectionsHint') }}</Typography.Text>
      </Flex>

      <SectionList :module="module" />
    </AppPage>
  </template>
  <Result v-else status="404" :title="t('moduleNotFound')">
    <template #extra>
      <Button type="primary" @click="router.push({ name: RouteEnum.Dashboard })">
        {{ t('goHome') }}
      </Button>
    </template>
  </Result>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import {
  Button, Card, Col, Flex, Progress, Result, Row, Statistic, Tag, Typography,
} from 'ant-design-vue'
import { useTranslation } from 'i18next-vue'
import gsap from 'gsap'
import AppPage from '@/components/layout/AppPage.vue'
import QuizPageHeader from '@/components/quiz/QuizPageHeader.vue'
import SectionList from '@/components/quiz/SectionList.vue'
import { useModuleProgress } from '@/composables/useModuleProgress'
import { useQuizModuleId } from '@/composables/useQuizRouteParams'
import { getQuizModule } from '@/services/quiz-loader'
import { RouteEnum } from '@/enums/route.enum'

const router = useRouter()
const { t } = useTranslation()
const moduleId = useQuizModuleId()

const module = computed(() => getQuizModule(moduleId.value))
const moduleProgress = useModuleProgress(module)

const statsRef = ref<ComponentPublicInstance | null>(null)

useHead({
  title: () => module.value ? `${module.value.title} | ${t('appTitle')}` : t('appTitle'),
})

onMounted(() => {
  const el = statsRef.value?.$el ?? statsRef.value
  if (el) {
    const cols = el.querySelectorAll('.ant-col')
    if (cols.length) {
      gsap.fromTo(
        cols,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out' },
      )
    }
  }
})
</script>
