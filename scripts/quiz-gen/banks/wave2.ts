import { moduleFromSections } from './compact'
import { topicsFromSeeds } from './data/wave2/auto-topic'
import {
  antDesignVueSeeds,
  javascriptSeeds,
  piniaSeeds,
  typescriptSeeds,
  vueRouterSeeds,
  vueSeeds,
  vueuseCoreSeeds,
  vueuseHeadSeeds,
  vueuseRouterSeeds,
} from './data/wave2/seeds'
import type { ModuleExpansion } from './build'

export const wave2Expansions: ModuleExpansion[] = [
  moduleFromSections('javascript', [
    {
      id: 'master-js',
      title: 'مرور جامع JavaScript',
      description: 'مفاهیم عمیق زبان برای مسیر تا CTO',
      idPrefix: 'jsm',
      topics: topicsFromSeeds(javascriptSeeds, 'JavaScript'),
    },
  ]),
  moduleFromSections('typescript', [
    {
      id: 'master-ts',
      title: 'مرور جامع TypeScript',
      description: 'نوع‌دهی پیشرفته و Vue',
      idPrefix: 'tsm',
      topics: topicsFromSeeds(typescriptSeeds, 'TypeScript'),
    },
  ]),
  moduleFromSections('vue', [
    {
      id: 'master-vue',
      title: 'مرور جامع Vue 3',
      description: 'الگوها، SSR و اکوسیستم',
      idPrefix: 'vuem',
      topics: topicsFromSeeds(vueSeeds, 'Vue 3'),
    },
  ]),
  moduleFromSections('pinia', [
    {
      id: 'master-pinia',
      title: 'مرور جامع Pinia',
      description: 'state، plugin و SSR',
      idPrefix: 'pinm',
      topics: topicsFromSeeds(piniaSeeds, 'Pinia'),
    },
  ]),
  moduleFromSections('vue-router', [
    {
      id: 'master-router',
      title: 'مرور جامع Vue Router',
      description: 'navigation، meta و enterprise',
      idPrefix: 'routm',
      topics: topicsFromSeeds(vueRouterSeeds, 'Vue Router'),
    },
  ]),
  moduleFromSections('vueuse-core', [
    {
      id: 'master-vucore',
      title: 'مرور جامع VueUse Core',
      description: 'composableهای پرکاربرد',
      idPrefix: 'vucm',
      topics: topicsFromSeeds(vueuseCoreSeeds, 'VueUse Core'),
    },
  ]),
  moduleFromSections('vueuse-head', [
    {
      id: 'master-head',
      title: 'مرور جامع VueUse Head',
      description: 'SEO و head management',
      idPrefix: 'hdm',
      topics: topicsFromSeeds(vueuseHeadSeeds, 'VueUse Head'),
    },
  ]),
  moduleFromSections('vueuse-router', [
    {
      id: 'master-vurouter',
      title: 'مرور جامع VueUse Router',
      description: 'URL state و query',
      idPrefix: 'vurm',
      topics: topicsFromSeeds(vueuseRouterSeeds, 'VueUse Router'),
    },
  ]),
  moduleFromSections('ant-design-vue', [
    {
      id: 'master-antd',
      title: 'مرور جامع Ant Design Vue',
      description: 'UI kit و الگوهای enterprise',
      idPrefix: 'antm',
      topics: topicsFromSeeds(antDesignVueSeeds, 'Ant Design Vue'),
    },
  ]),
]
