<template>
  <Flex justify="space-between" align="start" wrap="wrap" gap="middle">
    <Flex gap="middle" align="start">
      <Button
        v-if="showBack"
        type="text"
        shape="circle"
        :aria-label="t('back')"
        @click="emit('back')"
        class="flex! items-center"
      >
        <template #icon>
          <Icon icon="tabler:arrow-right" :width="18" :height="18" />
        </template>
      </Button>

      <slot name="avatar" />

      <Flex vertical gap="4px">
        <Typography.Title :level="3">{{ title }}</Typography.Title>
        <Typography.Text v-if="subTitle" type="secondary">
          {{ subTitle }}
        </Typography.Text>
      </Flex>
    </Flex>

    <Space v-if="$slots.extra" wrap>
      <slot name="extra" />
    </Space>
  </Flex>
</template>

<script setup lang="ts">
import { Button, Flex, Space, Typography } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useTranslation } from 'i18next-vue'

withDefaults(
  defineProps<{
    title: string
    subTitle?: string
    showBack?: boolean
  }>(),
  { showBack: true },
)

const emit = defineEmits<{
  back: []
}>()

const { t } = useTranslation()
</script>
