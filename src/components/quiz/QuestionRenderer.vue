<template>
  <Flex vertical gap="large" ref="rootRef">
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
      <Flex vertical gap="small" ref="optionsRef">
        <Card
          v-for="opt in question.options"
          :key="opt.id"
          size="small"
          :hoverable="!disabled"
          :body-style="optionBodyStyle"
          :style="optionCardStyle(opt.id)"
          class="option-card"
          @click="onOptionClick(opt.id, false)"
        >
          <Flex align="center" justify="space-between" gap="small">
            <Radio :value="opt.id" :disabled="disabled">
              {{ opt.text }}
            </Radio>
            <Transition :css="false" @enter="iconEnter">
              <Icon
                v-if="resultIcon(opt.id)"
                :icon="resultIcon(opt.id)!.icon"
                :width="18"
                :height="18"
                :style="{ color: resultIcon(opt.id)!.color, flexShrink: 0 }"
              />
            </Transition>
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
      <Flex vertical gap="small" ref="optionsRef">
        <Card
          v-for="opt in question.options"
          :key="opt.id"
          size="small"
          :hoverable="!disabled"
          :body-style="optionBodyStyle"
          :style="optionCardStyle(opt.id)"
          class="option-card"
          @click="onOptionClick(opt.id, true)"
        >
          <Flex align="center" justify="space-between" gap="small">
            <Checkbox :value="opt.id" :disabled="disabled">
              {{ opt.text }}
            </Checkbox>
            <Transition :css="false" @enter="iconEnter">
              <Icon
                v-if="resultIcon(opt.id)"
                :icon="resultIcon(opt.id)!.icon"
                :width="18"
                :height="18"
                :style="{ color: resultIcon(opt.id)!.color, flexShrink: 0 }"
              />
            </Transition>
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
import { computed, ref, watch, nextTick, type ComponentPublicInstance } from 'vue'
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
import gsap from 'gsap'
import type { Question, QuestionType } from '@/types/quiz.types'
import { popIn } from '@/composables/useGsap'

const props = defineProps<{
  question: Question
  selectedIds: string[]
  disabled?: boolean
  revealAnswer?: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
}>()

const { t } = useTranslation()

const rootRef = ref<ComponentPublicInstance | null>(null)
const optionsRef = ref<ComponentPublicInstance | null>(null)

watch(
  () => props.question.id,
  async () => {
    await nextTick()
    const el = optionsRef.value?.$el ?? optionsRef.value
    if (!el) return
    const cards = el.querySelectorAll('.option-card')
    if (!cards.length) return
    gsap.fromTo(
      cards,
      { opacity: 0, y: 12, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.32, ease: 'power2.out' },
    )
  },
)

function iconEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(3)', onComplete: done },
  )
}

const optionBodyStyle = { padding: '12px 16px' }

const typeMeta: Record<QuestionType, { label: string; icon: string; color: string; hint: string | null }> = {
  single: { label: t('typeSingle'), icon: 'tabler:circle-dot', color: 'blue', hint: t('hintSingle') },
  multi: { label: t('typeMulti'), icon: 'tabler:checkbox', color: 'purple', hint: t('hintMulti') },
  trueFalse: { label: t('typeTrueFalse'), icon: 'tabler:toggle-left', color: 'cyan', hint: null },
}

const typeLabel = computed(() => typeMeta[props.question.type].label)
const typeIcon = computed(() => typeMeta[props.question.type].icon)
const typeColor = computed(() => typeMeta[props.question.type].color)
const hintText = computed(() => typeMeta[props.question.type].hint)

const trueFalseOptions = computed(
  () => props.question.options ?? [
    { id: 'true', text: t('trueLabel') },
    { id: 'false', text: t('falseLabel') },
  ],
)

const segmentedOptions = computed(() =>
  trueFalseOptions.value.map((opt) => ({ label: opt.text, value: opt.id })),
)

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
    transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
  }
}

function resultIcon(optionId: string): { icon: string; color: string } | null {
  if (!props.revealAnswer) return null
  const v = optionVisual(optionId)
  if (v === 'correct') return { icon: 'tabler:circle-check', color: '#52c41a' }
  if (v === 'missed-correct') return { icon: 'tabler:alert-circle', color: '#faad14' }
  if (v === 'wrong') return { icon: 'tabler:circle-x', color: '#ff4d4f' }
  return null
}

function onSingleChange(val: string) { emit('update:selectedIds', [val]) }
function onMultiChange(vals: Array<string | number | boolean>) {
  emit('update:selectedIds', vals.map((v) => String(v)))
}
function onTrueFalseChange(val: string | number) { emit('update:selectedIds', [String(val)]) }

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
