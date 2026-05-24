<template>
  <Button type="default" class="absolute! top-4 left-4 z-10" :aria-label="isDark ? t('themeLight') : t('themeDark')" @click="toggleTheme">
    <template #icon>
      <Icon :icon="isDark ? 'tabler:sun' : 'tabler:moon'" :width="16" :height="16" />
    </template>
  </Button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useTranslation } from 'i18next-vue'
import { useThemeStore } from '@/stores/theme.store'

const { t } = useTranslation()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

function toggleTheme() {
  themeStore.toggleDark()
}
</script>
