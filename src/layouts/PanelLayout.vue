<template>
  <Layout>
    <Layout.Content>
      <Card class="relative!">
        <ToggleTheme />
        <RouterView v-slot="{ Component, route: viewRoute }">
          <Transition
            :css="false"
            mode="out-in"
            @enter="onEnter"
            @leave="onLeave"
          >
            <component :is="Component" :key="viewRoute.path" />
          </Transition>
        </RouterView>
      </Card>
    </Layout.Content>
  </Layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Card, Layout } from 'ant-design-vue'
import { RouteEnum } from '@/enums/route.enum'
import ToggleTheme from '@/components/layout/ToggleTheme.vue'
import gsap from 'gsap'

const route = useRoute()
const selectedKeys = ref<string[]>(['dashboard'])

watch(
  () => [route.name, route.params.moduleId],
  () => {
    if (route.name === RouteEnum.Dashboard) {
      selectedKeys.value = ['dashboard']
      return
    }
    const moduleId = route.params.moduleId
    if (typeof moduleId === 'string') {
      selectedKeys.value = [moduleId]
    }
  },
  { immediate: true },
)

function onEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', onComplete: done },
  )
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: done })
}
</script>
