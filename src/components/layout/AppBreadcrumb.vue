<template>
  <Breadcrumb>
    <Breadcrumb.Item v-for="(item, index) in crumbs" :key="index">
      <a v-if="item.onClick" @click.prevent="item.onClick">
        {{ item.title }}
      </a>
      <span v-else>{{ item.title }}</span>
    </Breadcrumb.Item>
  </Breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Breadcrumb } from 'ant-design-vue'
import { useTranslation } from 'i18next-vue'
import { getQuizModule } from '@/services/quiz-loader'
import { RouteEnum } from '@/enums/route.enum'

const route = useRoute()
const router = useRouter()
const { t } = useTranslation()

const crumbs = computed(() => {
  const items: { title: string; onClick?: () => void }[] = [
    {
      title: t('dashboard'),
      onClick: () => router.push({ name: RouteEnum.Dashboard }),
    },
  ]

  const moduleId = route.params.moduleId
  if (typeof moduleId === 'string') {
    const mod = getQuizModule(moduleId)
    const isModuleLeaf =
      route.name === RouteEnum.ModuleDetail ||
      route.name === RouteEnum.Quiz ||
      route.name === RouteEnum.WrongQuiz

    items.push({
      title: mod?.title ?? moduleId,
      onClick: isModuleLeaf
        ? undefined
        : () =>
            router.push({
              name: RouteEnum.ModuleDetail,
              params: { moduleId },
            }),
    })

    if (route.name === RouteEnum.Quiz) {
      items.push({ title: t('startQuiz') })
    }
    if (route.name === RouteEnum.WrongQuiz) {
      items.push({ title: t('wrongQuizTitle') })
    }
  }

  return items
})
</script>
