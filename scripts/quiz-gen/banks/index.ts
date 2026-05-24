import { moduleFromSections } from './compact'
import { allJavascriptNewTopics } from './data/javascript'
import { javascriptExtraTopics } from './data/javascript-extra'
import { typescriptTopics } from './data/bulk-typescript'
import { vueTopics } from './data/bulk-vue'
import {
  antDesignVueTopics,
  piniaTopics,
  vueRouterTopics,
  vueuseCoreTopics,
  vueuseHeadTopics,
  vueuseRouterTopics,
} from './data/bulk-rest'
import type { ModuleExpansion } from './build'
import type { CompactTopic } from './compact'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function jsSections(topics: CompactTopic[]): ModuleExpansion['sections'] {
  const parts = chunk(topics, 6)
  const titles = [
    ['deep-runtime', 'Runtime و حافظه', 'GC، buffer، امنیت'],
    ['deep-async', 'ناهمگام و رویداد', 'Promise، loop، DOM'],
    ['deep-language', 'زبان و داده', 'coercion، JSON، types'],
    ['deep-tooling', 'ابزار و کیفیت', 'bundle، test، perf'],
  ] as const
  return parts.map((t, i) => {
    const meta = titles[i] ?? [`deep-extra-${i}`, `فصل عمیق ${i + 1}`, '']
    return {
      id: meta[0],
      title: meta[1],
      description: meta[2],
      idPrefix: 'js',
      topics: t,
    }
  })
}

const allJsTopics = [...allJavascriptNewTopics, ...javascriptExtraTopics]

export const expansions: ModuleExpansion[] = [
  moduleFromSections('javascript', jsSections(allJsTopics)),
  moduleFromSections('typescript', [
    {
      id: 'types-deep',
      title: 'TypeScript عمیق',
      description: 'generics، utility types و Vue typing',
      idPrefix: 'ts',
      topics: typescriptTopics,
    },
  ]),
  moduleFromSections('vue', [
    {
      id: 'vue-deep',
      title: 'Vue 3 عمیق',
      description: 'compiler، SSR، testing و الگوها',
      idPrefix: 'vue',
      topics: vueTopics,
    },
  ]),
  moduleFromSections('pinia', [
    {
      id: 'pinia-deep',
      title: 'Pinia عمیق',
      description: 'setup store، SSR، testing',
      idPrefix: 'pinia',
      topics: piniaTopics,
    },
  ]),
  moduleFromSections('vue-router', [
    {
      id: 'router-deep',
      title: 'Vue Router عمیق',
      description: 'navigation، lazy، guards',
      idPrefix: 'router',
      topics: vueRouterTopics,
    },
  ]),
  moduleFromSections('vueuse-core', [
    {
      id: 'vueuse-deep',
      title: 'VueUse Core عمیق',
      description: 'storage، DOM، fetch',
      idPrefix: 'vu',
      topics: vueuseCoreTopics,
    },
  ]),
  moduleFromSections('vueuse-head', [
    {
      id: 'head-deep',
      title: 'VueUse Head عمیق',
      description: 'SEO، SSR، امنیت',
      idPrefix: 'head',
      topics: vueuseHeadTopics,
    },
  ]),
  moduleFromSections('vueuse-router', [
    {
      id: 'vurouter-deep',
      title: 'VueUse Router عمیق',
      description: 'query، params، sync',
      idPrefix: 'vur',
      topics: vueuseRouterTopics,
    },
  ]),
  moduleFromSections('ant-design-vue', [
    {
      id: 'antd-deep',
      title: 'Ant Design Vue عمیق',
      description: 'form، table، theme، a11y',
      idPrefix: 'antd',
      topics: antDesignVueTopics,
    },
  ]),
]
