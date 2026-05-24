<template>
  <Card hoverable @click="goToModule">
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="start" gap="middle">
        <Flex gap="middle" align="center">
          <BrandAvatar :module-id="module.id" :size="48" />
          <Flex vertical gap="2px">
            <Typography.Text strong>{{ module.title }}</Typography.Text>
            <Typography.Text type="secondary" :style="{ fontSize: '12px' }">
              {{ t('sectionCount', { count: sectionCount }) }} ·
              {{ t('questionCount', { count: progress.totalQuestions }) }}
            </Typography.Text>
          </Flex>
        </Flex>
        <Tag v-if="progress.wrongCount > 0" color="error" :bordered="false">
          {{ t('wrongCountShort', { count: progress.wrongCount }) }}
        </Tag>
      </Flex>

      <Typography.Paragraph
        type="secondary"
        :ellipsis="{ rows: 2 }"
        :style="{ minHeight: '44px', marginBottom: 0 }"
      >
        {{ module.description }}
      </Typography.Paragraph>

      <Flex vertical gap="4px">
        <Flex justify="space-between" align="center">
          <Typography.Text type="secondary" :style="{ fontSize: '12px' }">
            {{ t('progress') }}
          </Typography.Text>
          <Typography.Text strong :style="{ fontSize: '12px' }">
            {{ progress.percent }}%
          </Typography.Text>
        </Flex>
        <Progress
          :percent="progress.percent"
          :show-info="false"
          size="small"
          :stroke-color="progress.percent === 100 ? '#52c41a' : '#1677ff'"
        />
      </Flex>

      <Button type="link" :style="{ padding: 0, alignSelf: 'flex-start' }">
        <Flex align="center" gap="4px">
          <span>{{ t('enterModule') }}</span>
          <Icon icon="tabler:arrow-left" :width="14" :height="14" />
        </Flex>
      </Button>
    </Flex>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Button,
  Card,
  Flex,
  Progress,
  Tag,
  Typography,
} from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'
import BrandAvatar from '@/components/common/BrandAvatar.vue'
import type { QuizModule } from '@/types/quiz.types'
import { useModuleProgress } from '@/composables/useModuleProgress'
import { RouteEnum } from '@/enums/route.enum'

const props = defineProps<{
  module: QuizModule
}>()

const router = useRouter()
const { t } = useTranslation()
const progress = useModuleProgress(() => props.module)

const sectionCount = computed(() => props.module.sections.length)

function goToModule() {
  router.push({
    name: RouteEnum.ModuleDetail,
    params: { moduleId: props.module.id },
  })
}
</script>
