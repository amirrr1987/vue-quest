<template>
  <Flex vertical gap="small">
    <Typography.Text type="secondary">{{ t('filterLevel') }}</Typography.Text>
    <Segmented
      v-model:value="selected"
      :options="options"
      block
    />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flex, Segmented, Typography } from 'ant-design-vue'
import type { LearningLevel } from '@/types/quiz.types'
import {
  LEARNING_LEVELS,
  LEARNING_LEVEL_I18N_KEYS,
} from '@/constants/learning-levels'
import { useTranslation } from 'i18next-vue'

const model = defineModel<LearningLevel | null>('level', { default: null })
const { t } = useTranslation()

const selected = computed({
  get: () => model.value ?? 'all',
  set: (val: string | number) => {
    model.value = val === 'all' ? null : (val as LearningLevel)
  },
})

const options = computed(() => [
  { label: t('allLevels'), value: 'all' },
  ...LEARNING_LEVELS.map((level) => ({
    label: t(LEARNING_LEVEL_I18N_KEYS[level]),
    value: level,
  })),
])
</script>
