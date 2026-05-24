<template>
  <Flex justify="space-between" align="center" wrap="wrap" gap="small">
    <Button :disabled="!canPrev" @click="emit('prev')">
      <template #icon>
        <Icon icon="tabler:arrow-right" :width="16" :height="16" />
      </template>
      {{ t('prev') }}
    </Button>
    <Space>
      <Button
        v-if="!submitted"
        type="primary"
        size="large"
        :disabled="!canSubmit"
        @click="emit('submit')"
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
        @click="emit('next')"
      >
        {{ t('next') }}
        <template #icon>
          <Icon icon="tabler:arrow-left" :width="16" :height="16" />
        </template>
      </Button>
      <Button v-else type="primary" size="large" @click="emit('finish')">
        <template #icon>
          <Icon icon="tabler:flag-check" :width="16" :height="16" />
        </template>
        {{ t('finish') }}
      </Button>
    </Space>
  </Flex>
</template>

<script setup lang="ts">
import { Button, Flex, Space } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'

defineProps<{
  submitted: boolean
  finished: boolean
  canSubmit: boolean
  canPrev: boolean
}>()

const emit = defineEmits<{
  prev: []
  submit: []
  next: []
  finish: []
}>()

const { t } = useTranslation()
</script>
