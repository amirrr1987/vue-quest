import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { Locale } from 'ant-design-vue/es/locale'
import faIR from 'ant-design-vue/es/locale/fa_IR'
import type { DirectionType, MappingAlgorithm } from 'ant-design-vue/es/config-provider/context'
import { theme as antTheme } from 'ant-design-vue'
import { appComponentToken, appToken } from '@/theme/app-theme'

function resolveAlgorithms(dark: boolean, compact: boolean): MappingAlgorithm[] {
  const algorithms: MappingAlgorithm[] = [dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm]
  if (compact) {
    algorithms.push(antTheme.compactAlgorithm)
  }
  return algorithms
}

export const useThemeStore = defineStore('theme', () => {
  const componentSize = ref<SizeType>('middle')
  const locale = ref<Locale>(faIR)
  const direction = ref<DirectionType>('rtl')
  const isDark = useLocalStorage('vue-masir-theme-dark', false)
  const isCompact = useLocalStorage('vue-masir-theme-compact', false)

  const algorithm = ref<MappingAlgorithm[]>(resolveAlgorithms(isDark.value, isCompact.value))

  const theme = computed(() => ({
    token: appToken,
    components: appComponentToken,
    algorithm: algorithm.value,
  }))

  function applyDocumentTheme(dark: boolean) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }

  watch(
    [isDark, isCompact],
    ([darkVal, compactVal]) => {
      algorithm.value = resolveAlgorithms(darkVal, compactVal)
      applyDocumentTheme(darkVal)
    },
    { immediate: true },
  )

  function toggleDark() {
    isDark.value = !isDark.value
  }

  function toggleCompact() {
    isCompact.value = !isCompact.value
  }

  return {
    componentSize,
    locale,
    theme,
    direction,
    isDark,
    isCompact,
    toggleDark,
    toggleCompact,
  }
})
