import { computed } from 'vue'
import { useRouteParams } from '@vueuse/router'

export function useQuizModuleId() {
  const moduleId = useRouteParams('moduleId')
  return computed(() => String(moduleId.value ?? ''))
}

export function useQuizSectionParams() {
  const moduleId = useRouteParams('moduleId')
  const sectionId = useRouteParams('sectionId')

  return {
    moduleId: computed(() => String(moduleId.value ?? '')),
    sectionId: computed(() => String(sectionId.value ?? '')),
  }
}
