<template>
  <List.Item>
    <Flex
      :vertical="vertical"
      :gap="vertical ? 'middle' : 'large'"
      :justify="vertical ? undefined : 'space-between'"
      :align="vertical ? undefined : 'center'"
      :style="{ width: '100%' }"
      wrap="wrap"
    >
      <Flex vertical gap="8px" :style="{ flex: 1, minWidth: '240px' }">
        <Flex align="center" gap="small" wrap="wrap">
          <Typography.Text strong>{{ section.title }}</Typography.Text>
          <Badge
            v-if="progress.wrongCount > 0"
            :count="progress.wrongCount"
            :overflow-count="99"
            status="error"
            :title="t('wrongCountShort', { count: progress.wrongCount })"
          />
        </Flex>

        <Typography.Text v-if="section.description" type="secondary">
          {{ section.description }}
        </Typography.Text>

        <Space wrap size="small">
          <Tag :bordered="false">
            <Icon
              icon="tabler:help-circle"
              :width="12"
              :height="12"
              :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
            />
            {{ t('questionCount', { count: section.questions.length }) }}
          </Tag>
          <Tag v-if="progress.answered > 0" color="processing" :bordered="false">
            {{ t('progressPercent', { percent: progress.percent }) }}
          </Tag>
          <Tag v-if="progress.attempts > 0" :bordered="false">
            {{ t('accuracy', { percent: progress.accuracy }) }}
          </Tag>
        </Space>

        <Progress
          :percent="progress.percent"
          size="small"
          :show-info="false"
        />
      </Flex>

      <Space wrap>
        <Button type="primary" @click="emit('quiz')">
          <template #icon>
            <Icon icon="tabler:player-play" :width="16" :height="16" />
          </template>
          {{ t('startQuiz') }}
        </Button>
        <Tooltip :title="wrongQuizTooltip">
          <Button
            :disabled="progress.wrongCount === 0"
            @click="emit('wrongQuiz')"
          >
            <template #icon>
              <Icon icon="tabler:refresh" :width="16" :height="16" />
            </template>
            {{ t('wrongQuizCta') }}
          </Button>
        </Tooltip>
        <Popconfirm
          :title="t('resetConfirm')"
          ok-text="بله"
          cancel-text="انصراف"
          :ok-button-props="{ danger: true }"
          @confirm="emit('reset')"
        >
          <Tooltip :title="t('resetSection')">
            <Button danger type="text" :aria-label="t('resetSection')">
              <template #icon>
                <Icon icon="tabler:trash" :width="16" :height="16" />
              </template>
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
    </Flex>
  </List.Item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Badge,
  Button,
  Flex,
  List,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'
import type { QuizSection } from '@/types/quiz.types'
import { useSectionProgress } from '@/composables/useModuleProgress'

const props = withDefaults(
  defineProps<{
    moduleId: string
    section: QuizSection
    vertical?: boolean
  }>(),
  { vertical: false },
)

const emit = defineEmits<{
  quiz: []
  wrongQuiz: []
  reset: []
}>()

const { t } = useTranslation()
const progress = useSectionProgress(
  () => props.moduleId,
  () => props.section.id,
  () => props.section.questions.length,
)

const wrongQuizTooltip = computed(() =>
  progress.value.wrongCount === 0 ? t('emptyReview') : t('wrongQuizCta'),
)
</script>
