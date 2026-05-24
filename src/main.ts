import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import I18NextVue from 'i18next-vue'
import 'ant-design-vue/dist/reset.css'
import '@/assets/css/main.css'
import 'nprogress/nprogress.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)
app.use(I18NextVue, { i18next: i18n })

app.mount('#app')
