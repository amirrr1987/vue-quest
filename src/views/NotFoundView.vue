<template>
  <AppPage>
    <Result status="404" :title="t('notFound')" :sub-title="t('notFoundHint')">
      <template #extra>
        <Button
          type="primary"
          size="large"
          @click="router.push({ name: RouteEnum.Dashboard })"
        >
          {{ t('goHome') }}
        </Button>
      </template>
    </Result>
  </AppPage>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { Button, Result } from 'ant-design-vue'
import { useTranslation } from 'i18next-vue'
import AppPage from '@/components/layout/AppPage.vue'
import { RouteEnum } from '@/enums/route.enum'

const router = useRouter()
const { t } = useTranslation()

useHead({ title: () => `${t('notFound')} | ${t('appTitle')}` })
</script>
