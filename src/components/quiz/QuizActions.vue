<template>
  <Flex justify="space-between" align="center" wrap="wrap" gap="small">
    <Button :disabled="!canPrev" @click="emit('prev')" class="flex! items-center">
      <template #icon>
        <Icon icon="tabler:arrow-right" :width="16" :height="16" />
      </template>
      {{ t('prev') }}
    </Button>

    <Space wrap>
      <Button
        v-if="!submitted && !reviewing"
        type="primary"
        size="large"
        :disabled="!canSubmit"
        @click="emit('submit')"
        class="flex! items-center"
      >
        <template #icon>
          <Icon icon="tabler:check" :width="16" :height="16" />
        </template>
        {{ t('submit') }}
      </Button>

      <Button
        v-else-if="!finished"
        type="primary"
        size="large"
        :disabled="!canNext"
        @click="emit('next')"
        class="flex! items-center"
      >
        {{ nextLabel }}
        <template #icon>
          <Icon :icon="nextIcon" :width="16" :height="16" />
        </template>
      </Button>

      <Button v-else type="primary" size="large" @click="emit('finish')" class="flex! items-center">
        <template #icon>
          <Icon icon="tabler:flag-check" :width="16" :height="16" />
        </template>
        {{ t('finish') }}
      </Button>
    </Space>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button, Flex, Space } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'

const props = defineProps<{
  submitted: boolean
  finished: boolean
  reviewing: boolean
  canSubmit: boolean
  canPrev: boolean
  canNext: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  prev: []
  submit: []
  next: []
  finish: []
}>()

const { t } = useTranslation()

const nextLabel = computed(() => {
  if (props.isLast && props.submitted) return t('finish')
  return t('next')
})

const nextIcon = computed(() => {
  if (props.isLast && props.submitted) return 'tabler:flag-check'
  return 'tabler:arrow-left'
})
</script>
