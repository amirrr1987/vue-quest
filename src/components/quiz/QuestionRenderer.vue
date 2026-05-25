<template>
  <Flex vertical gap="large">
    <Flex vertical gap="small">
      <Tag :bordered="false" :color="typeColor" :style="{ alignSelf: 'flex-start' }">
        <Icon
          :icon="typeIcon"
          :width="12"
          :height="12"
          :style="{ verticalAlign: 'middle', marginInlineEnd: '4px' }"
        />
        {{ typeLabel }}
      </Tag>
      <Typography.Title :level="4" :style="{ margin: 0 }">
        {{ question.text }}
      </Typography.Title>
      <Typography.Text v-if="hintText" type="secondary">
        {{ hintText }}
      </Typography.Text>
    </Flex>

    <Radio.Group
      v-if="question.type === 'single'"
      :value="selectedIds[0]"
      :disabled="disabled"
      :style="{ width: '100%' }"
      @update:value="onSingleChange"
    >
      <Flex vertical gap="small">
        <Card
          v-for="opt in question.options"
          :key="opt.id"
          size="small"
          :hoverable="!disabled"
          :body-style="optionBodyStyle(opt.id)"
          :style="optionCardStyle(opt.id)"
          @click="onOptionClick(opt.id, false)"
        >
          <Flex align="center" justify="space-between" gap="small">
            <Radio :value="opt.id" :disabled="disabled">
              {{ opt.text }}
            </Radio>
            <Icon
              v-if="resultIcon(opt.id)"
              :icon="resultIcon(opt.id)!.icon"
              :width="18"
              :height="18"
              :style="{ color: resultIcon(opt.id)!.color, flexShrink: 0 }"
            />
          </Flex>
        </Card>
      </Flex>
    </Radio.Group>

    <Checkbox.Group
      v-else-if="question.type === 'multi'"
      :value="selectedIds"
      :disabled="disabled"
      :style="{ width: '100%' }"
      @update:value="onMultiChange"
    >
      <Flex vertical gap="small">
        <Card
          v-for="opt in question.options"
          :key="opt.id"
          size="small"
          :hoverable="!disabled"
          :body-style="optionBodyStyle(opt.id)"
          :style="optionCardStyle(opt.id)"
          @click="onOptionClick(opt.id, true)"
        >
          <Flex align="center" justify="space-between" gap="small">
            <Checkbox :value="opt.id" :disabled="disabled">
              {{ opt.text }}
            </Checkbox>
            <Icon
              v-if="resultIcon(opt.id)"
              :icon="resultIcon(opt.id)!.icon"
              :width="18"
              :height="18"
              :style="{ color: resultIcon(opt.id)!.color, flexShrink: 0 }"
            />
          </Flex>
        </Card>
      </Flex>
    </Checkbox.Group>

    <Segmented
      v-else-if="question.type === 'trueFalse'"
      block
      size="large"
      :disabled="disabled"
      :value="selectedIds[0]"
      :options="segmentedOptions"
      @update:value="onTrueFalseChange"
    />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Card,
  Checkbox,
  Flex,
  Radio,
  Segmented,
  Tag,
  Typography,
} from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'
import type { Question, QuestionType } from '@/types/quiz.types'

const props = defineProps<{
  question: Question
  selectedIds: string[]
  disabled?: boolean
  /** پس از submit برای رنگ‌آمیزی صحیح/غلط فعال می‌شود */
  revealAnswer?: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
}>()

const { t } = useTranslation()

const typeMeta: Record<QuestionType, { label: string; icon: string; color: string; hint: string | null }> = {
  single: {
    label: t('typeSingle'),
    icon: 'tabler:circle-dot',
    color: 'blue',
    hint: t('hintSingle'),
  },
  multi: {
    label: t('typeMulti'),
    icon: 'tabler:checkbox',
    color: 'purple',
    hint: t('hintMulti'),
  },
  trueFalse: {
    label: t('typeTrueFalse'),
    icon: 'tabler:toggle-left',
    color: 'cyan',
    hint: null,
  },
}

const typeLabel = computed(() => typeMeta[props.question.type].label)
const typeIcon = computed(() => typeMeta[props.question.type].icon)
const typeColor = computed(() => typeMeta[props.question.type].color)
const hintText = computed(() => typeMeta[props.question.type].hint)

const trueFalseOptions = computed(
  () =>
    props.question.options ?? [
      { id: 'true', text: t('trueLabel') },
      { id: 'false', text: t('falseLabel') },
    ],
)

const segmentedOptions = computed(() =>
  trueFalseOptions.value.map((opt) => ({
    label: opt.text,
    value: opt.id,
  })),
)

/**
 * وضعیت visual یک گزینه بعد از reveal:
 *  - correct: گزینه از پاسخ‌های صحیح
 *  - missed-correct: صحیح بود ولی کاربر انتخاب نکرد
 *  - wrong: کاربر اشتباه انتخاب کرد
 *  - selected: انتخاب فعلی (قبل از reveal)
 */
type OptionVisual = 'correct' | 'missed-correct' | 'wrong' | 'selected' | 'idle'

function optionVisual(optionId: string): OptionVisual {
  const isCorrect = props.question.correctIds.includes(optionId)
  const isSelected = props.selectedIds.includes(optionId)
  if (props.revealAnswer) {
    if (isCorrect && isSelected) return 'correct'
    if (isCorrect && !isSelected) return 'missed-correct'
    if (!isCorrect && isSelected) return 'wrong'
    return 'idle'
  }
  return isSelected ? 'selected' : 'idle'
}

const VISUAL_STYLES: Record<OptionVisual, { border: string; bg: string }> = {
  correct: { border: '#52c41a', bg: '#f6ffed' },
  'missed-correct': { border: '#faad14', bg: '#fffbe6' },
  wrong: { border: '#ff4d4f', bg: '#fff1f0' },
  selected: { border: '#1677ff', bg: '#e6f4ff' },
  idle: { border: 'transparent', bg: 'transparent' },
}

function optionCardStyle(optionId: string) {
  const v = optionVisual(optionId)
  const s = VISUAL_STYLES[v]
  return {
    borderColor: s.border,
    backgroundColor: s.bg,
    transition: 'border-color 0.15s, background-color 0.15s',
  }
}

function optionBodyStyle(_optionId: string) {
  return { padding: '12px 16px' }
}

function resultIcon(optionId: string): { icon: string; color: string } | null {
  if (!props.revealAnswer) return null
  const v = optionVisual(optionId)
  if (v === 'correct') return { icon: 'tabler:circle-check', color: '#52c41a' }
  if (v === 'missed-correct')
    return { icon: 'tabler:alert-circle', color: '#faad14' }
  if (v === 'wrong') return { icon: 'tabler:circle-x', color: '#ff4d4f' }
  return null
}

function onSingleChange(val: string) {
  emit('update:selectedIds', [val])
}

function onMultiChange(vals: Array<string | number | boolean>) {
  emit(
    'update:selectedIds',
    vals.map((v) => String(v)),
  )
}

function onTrueFalseChange(val: string | number) {
  emit('update:selectedIds', [String(val)])
}

function onOptionClick(id: string, multiple: boolean) {
  if (props.disabled) return
  if (multiple) {
    const set = new Set(props.selectedIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    emit('update:selectedIds', [...set])
  } else {
    emit('update:selectedIds', [id])
  }
}
</script>
