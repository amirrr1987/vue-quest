import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createHead } from '@vueuse/head'
import I18NextVue from 'i18next-vue'
import App from '../App.vue'
import routes from '@/routes'
import i18n from '@/i18n'

describe('App', () => {
  it('mounts with router and pinia', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, createHead(), [I18NextVue, { i18next: i18n }]],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
