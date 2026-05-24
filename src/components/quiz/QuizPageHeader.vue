<template>
  <PageHeader
    :title="title"
    :sub-title="subTitle"
    :show-back="showBack"
    @back="emit('back')"
  >
    <template v-if="moduleId" #avatar>
      <BrandAvatar :module-id="moduleId" :size="56" />
    </template>
    <template v-if="$slots.extra" #extra>
      <slot name="extra" />
    </template>
  </PageHeader>
</template>

<script setup lang="ts">
import BrandAvatar from '@/components/common/BrandAvatar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

withDefaults(
  defineProps<{
    title: string
    subTitle?: string
    moduleId?: string
    showBack?: boolean
  }>(),
  { showBack: true },
)

const emit = defineEmits<{
  back: []
}>()
</script>
