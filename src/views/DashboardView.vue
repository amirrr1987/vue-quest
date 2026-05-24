<template>
  <AppPage>
    <Flex vertical gap="4px">
      <Typography.Title :level="2">
        {{ t('dashboard') }}
      </Typography.Title>
      <Typography.Text type="secondary">
        {{ t('appSubtitle') }}
      </Typography.Text>
    </Flex>

    <Card :bordered="false" :body-style="{ padding: '20px 24px' }">
      <Row :gutter="[24, 16]">
        <Col :xs="12" :md="6">
          <Statistic
            :title="t('totalModules')"
            :value="stats.moduleCount"
          >
            <template #prefix>
              <Icon
                icon="tabler:books"
                :width="20"
                :height="20"
                :style="{ color: '#1677ff' }"
              />
            </template>
          </Statistic>
        </Col>
        <Col :xs="12" :md="6">
          <Statistic
            :title="t('totalQuestions')"
            :value="stats.totalQuestions"
          >
            <template #prefix>
              <Icon
                icon="tabler:help-circle"
                :width="20"
                :height="20"
                :style="{ color: '#722ed1' }"
              />
            </template>
          </Statistic>
        </Col>
        <Col :xs="12" :md="6">
          <Statistic
            :title="t('progress')"
            :value="stats.percent"
            suffix="%"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <Icon
                icon="tabler:chart-bar"
                :width="20"
                :height="20"
                :style="{ color: '#52c41a' }"
              />
            </template>
          </Statistic>
        </Col>
        <Col :xs="12" :md="6">
          <Statistic
            :title="t('needsReview')"
            :value="stats.wrongCount"
            :value-style="
              stats.wrongCount > 0 ? { color: '#ff4d4f' } : undefined
            "
          >
            <template #prefix>
              <Icon
                icon="tabler:alert-circle"
                :width="20"
                :height="20"
                :style="{ color: '#ff4d4f' }"
              />
            </template>
          </Statistic>
        </Col>
      </Row>
    </Card>

    <Flex justify="space-between" align="end" wrap="wrap" gap="middle">
      <Flex vertical gap="2px">
        <Typography.Title :level="4">{{ t('modules') }}</Typography.Title>
        <Typography.Text type="secondary">
          {{ t('modulesHint') }}
        </Typography.Text>
      </Flex>
      <Tag :bordered="false" color="blue">
        {{ t('totalModules') }}: {{ stats.moduleCount }}
      </Tag>
    </Flex>

    <Row :gutter="[16, 16]">
      <Col v-for="mod in modules" :key="mod.id" :xs="24" :sm="12" :xl="8">
        <ModuleCard :module="mod" />
      </Col>
    </Row>
  </AppPage>
</template>

<script setup lang="ts">
import { Card, Col, Flex, Row, Statistic, Tag, Typography } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import { useTranslation } from 'i18next-vue'
import AppPage from '@/components/layout/AppPage.vue'
import ModuleCard from '@/components/quiz/ModuleCard.vue'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { getAllQuizModules } from '@/services/quiz-loader'

const { t } = useTranslation()
const modules = getAllQuizModules()
const stats = useDashboardStats()

useHead({
  title: () => `${t('dashboard')} | ${t('appTitle')}`,
})
</script>
