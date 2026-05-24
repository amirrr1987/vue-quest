<template>
  <List
    :data-source="module.sections"
    item-layout="vertical"
    :split="true"
    :bordered="false"
  >
    <template #renderItem="{ item: section }">
      <SectionListItem
        :module-id="module.id"
        :section="section"
        @quiz="startQuiz(section.id)"
        @wrong-quiz="startWrongQuiz(section.id)"
        @reset="resetSection(section.id)"
      />
    </template>
  </List>
</template>

<script setup lang="ts">
import { List, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
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

function startQuiz(sectionId: string) {
  router.push({
    name: RouteEnum.Quiz,
    params: { moduleId: props.module.id, sectionId },
  })
}

function startWrongQuiz(sectionId: string) {
  router.push({
    name: RouteEnum.WrongQuiz,
    params: { moduleId: props.module.id, sectionId },
  })
}

function resetSection(sectionId: string) {
  progressStore.resetSection(props.module.id, sectionId)
  message.success(t('resetDone'))
}
</script>
