<template>
  <Avatar :size="size" :style="avatarStyle" shape="square">
    <template #icon>
      <Icon :icon="brand.icon" :width="iconSize" :height="iconSize" />
    </template>
  </Avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Avatar } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { getModuleBrand } from '@/constants/module-brand'

const props = withDefaults(
  defineProps<{
    moduleId: string
    size?: number
  }>(),
  { size: 48 },
)

const brand = computed(() => getModuleBrand(props.moduleId))

const avatarStyle = computed(() => ({
  backgroundColor: brand.value.bg,
  color: brand.value.color,
}))

const iconSize = computed(() => Math.round(props.size * 0.6))
</script>
