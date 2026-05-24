<template>
  <Flex vertical gap="small">
    <Flex justify="space-between" align="center">
      <Typography.Text type="secondary" :style="{ fontSize: '13px' }">
        {{ label }}
      </Typography.Text>
      <Typography.Text strong :style="{ fontSize: '13px' }">
        {{ percent }}%
      </Typography.Text>
    </Flex>
    <Progress :percent="percent" :show-info="false" status="active" />
  </Flex>
</template>

<script setup lang="ts">
import { Flex, Progress, Typography } from 'ant-design-vue'

defineProps<{
  percent: number
  label: string
}>()
</script>
