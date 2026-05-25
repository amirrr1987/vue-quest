<template>
  <Flex vertical gap="small">
    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
      <Typography.Text type="secondary" :style="{ fontSize: '13px' }">
        {{ label }}
      </Typography.Text>
      <Space :size="8">
        <Tag :bordered="false" color="success">
          <Icon
            icon="tabler:circle-check"
            :width="12"
            :height="12"
            :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
          />
          {{ correctCount }}
        </Tag>
        <Tag :bordered="false" color="error">
          <Icon
            icon="tabler:circle-x"
            :width="12"
            :height="12"
            :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
          />
          {{ wrongCount }}
        </Tag>
        <Typography.Text strong :style="{ fontSize: '13px' }">
          {{ percent }}%
        </Typography.Text>
      </Space>
    </Flex>

    <Progress :percent="percent" :show-info="false" status="active" />

    <Flex
      v-if="statuses.length > 0 && statuses.length <= 60"
      wrap="wrap"
      :gap="4"
      :style="{ marginTop: '2px' }"
      ref="dotsContainerRef"
    >
      <Tooltip
        v-for="(s, i) in statuses"
        :key="i"
        :title="dotTooltip(s, i)"
      >
        <button
          type="button"
          :aria-label="dotTooltip(s, i)"
          :style="dotStyle(s)"
          :ref="(el) => setDotRef(i, el as HTMLElement | null)"
          @click="emit('jump', i)"
        />
      </Tooltip>
    </Flex>
  </Flex>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, type ComponentPublicInstance } from 'vue'
import { Flex, Progress, Space, Tag, Tooltip, Typography } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'
import gsap from 'gsap'

export type QuestionStatus = 'correct' | 'wrong' | 'current' | 'pending'

const props = defineProps<{
  percent: number
  label: string
  statuses?: QuestionStatus[]
}>()

const emit = defineEmits<{
  jump: [index: number]
}>()

const { t } = useTranslation()

const statuses = computed<QuestionStatus[]>(() => props.statuses ?? [])
const correctCount = computed(() => statuses.value.filter((s) => s === 'correct').length)
const wrongCount = computed(() => statuses.value.filter((s) => s === 'wrong').length)

const dotsContainerRef = ref<ComponentPublicInstance | null>(null)
const dotRefs = new Map<number, HTMLElement>()

function setDotRef(i: number, el: HTMLElement | null) {
  if (el) dotRefs.set(i, el)
  else dotRefs.delete(i)
}

const prevStatuses = ref<QuestionStatus[]>([])

watch(
  statuses,
  async (next, prev) => {
    if (!prev || prev.length === 0) {
      prevStatuses.value = [...next]
      return
    }
    await nextTick()
    for (let i = 0; i < next.length; i++) {
      if (next[i] !== prevStatuses.value[i]) {
        const el = dotRefs.get(i)
        if (el) {
          gsap.fromTo(
            el,
            { scale: 0.3 },
            { scale: 1, duration: 0.35, ease: 'back.out(3)' },
          )
        }
      }
    }
    prevStatuses.value = [...next]
  },
  { deep: true },
)

const DOT_COLORS: Record<QuestionStatus, { bg: string; border: string }> = {
  correct: { bg: '#52c41a', border: '#52c41a' },
  wrong: { bg: '#ff4d4f', border: '#ff4d4f' },
  current: { bg: '#fff', border: '#1677ff' },
  pending: { bg: 'rgba(0,0,0,0.06)', border: 'rgba(0,0,0,0.12)' },
}

function dotStyle(s: QuestionStatus) {
  const c = DOT_COLORS[s]
  return {
    width: s === 'current' ? '14px' : '12px',
    height: s === 'current' ? '14px' : '12px',
    borderRadius: '50%',
    background: c.bg,
    border: `2px solid ${c.border}`,
    padding: 0,
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s, width 0.2s, height 0.2s',
    boxShadow: s === 'current' ? '0 0 0 3px rgba(22,119,255,0.18)' : 'none',
  }
}

function dotTooltip(s: QuestionStatus, i: number) {
  const num = i + 1
  if (s === 'correct') return t('dotCorrect', { num })
  if (s === 'wrong') return t('dotWrong', { num })
  if (s === 'current') return t('dotCurrent', { num })
  return t('dotPending', { num })
}
</script>
