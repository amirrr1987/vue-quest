<template>
  <Flex justify="center">
    <Flex
      vertical
      :gap="gap"
      :style="{ maxWidth: `${maxWidth}px`, width: '100%' }"
    >
      <slot />
    </Flex>
  </Flex>
</template>

<script setup lang="ts">
import { Flex } from 'ant-design-vue'

withDefaults(
  defineProps<{
    /** Max content width in px — keeps long lines readable on wide screens */
    maxWidth?: number
    gap?: 'small' | 'middle' | 'large'
  }>(),
  { maxWidth: 1200, gap: 'large' },
)
</script>
