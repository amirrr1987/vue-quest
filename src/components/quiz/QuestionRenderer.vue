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
          hoverable
          :body-style="optionBodyStyle"
          @click="onOptionClick(opt.id, false)"
        >
          <Radio :value="opt.id" :disabled="disabled">
            {{ opt.text }}
          </Radio>
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
          hoverable
          :body-style="optionBodyStyle"
          @click="onOptionClick(opt.id, true)"
        >
          <Checkbox :value="opt.id" :disabled="disabled">
            {{ opt.text }}
          </Checkbox>
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
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
}>()

const { t } = useTranslation()

const optionBodyStyle = { padding: '12px 16px' }

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
