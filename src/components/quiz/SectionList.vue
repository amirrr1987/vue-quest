<template>
  <List
    :data-source="module.sections"
    item-layout="vertical"
    :split="true"
    :bordered="false"
    ref="listRef"
  >
    <template #renderItem="{ item: section }">
      <SectionListItem
        :module-id="module.id"
        :section="section"
        class="section-item"
        @quiz="startQuiz(section.id)"
        @wrong-quiz="startWrongQuiz(section.id)"
        @reset="resetSection(section.id)"
      />
    </template>
  </List>
</template>

<script setup lang="ts">
import { onMounted, ref, type ComponentPublicInstance } from 'vue'
import { List, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import gsap from 'gsap'
import type { QuizModule } from '@/types/quiz.types'
import { useProgressStore } from '@/stores/progress.store'
import { RouteEnum } from '@/enums/route.enum'
import SectionListItem from './SectionListItem.vue'

const props = defineProps<{
  module: QuizModule
}>()

const router = useRouter()
const { t } = useTranslation()
const progressStore = useProgressStore()

const listRef = ref<ComponentPublicInstance | null>(null)

function startQuiz(sectionId: string) {
  router.push({ name: RouteEnum.Quiz, params: { moduleId: props.module.id, sectionId } })
}

function startWrongQuiz(sectionId: string) {
  router.push({ name: RouteEnum.WrongQuiz, params: { moduleId: props.module.id, sectionId } })
}

function resetSection(sectionId: string) {
  progressStore.resetSection(props.module.id, sectionId)
  message.success(t('resetDone'))
}

onMounted(() => {
  const el = listRef.value?.$el ?? listRef.value
  if (el) {
    const items = el.querySelectorAll('.section-item')
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out', delay: 0.1 },
      )
    }
  }
})
</script>
