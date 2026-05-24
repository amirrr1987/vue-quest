/**
 * Brand identity per learning module — used for avatars, accents, tags.
 * Icons are Iconify names (works with @iconify/vue).
 */
export interface ModuleBrand {
  icon: string
  color: string
  bg: string
}

const FALLBACK: ModuleBrand = {
  icon: 'tabler:book-2',
  color: '#1677ff',
  bg: '#e6f4ff',
}

const BRANDS: Record<string, ModuleBrand> = {
  javascript: {
    icon: 'tabler:brand-javascript',
    color: '#b58900',
    bg: '#fffbe6',
  },
  typescript: {
    icon: 'tabler:brand-typescript',
    color: '#1677ff',
    bg: '#e6f4ff',
  },
  vue: {
    icon: 'tabler:brand-vue',
    color: '#389e0d',
    bg: '#f6ffed',
  },
  pinia: {
    icon: 'tabler:database',
    color: '#d4b106',
    bg: '#feffe6',
  },
  'vue-router': {
    icon: 'tabler:route',
    color: '#13c2c2',
    bg: '#e6fffb',
  },
  'vueuse-core': {
    icon: 'tabler:cube-3d-sphere',
    color: '#08979c',
    bg: '#e6fffb',
  },
  'vueuse-head': {
    icon: 'tabler:browser',
    color: '#722ed1',
    bg: '#f9f0ff',
  },
  'vueuse-router': {
    icon: 'tabler:directions',
    color: '#2f54eb',
    bg: '#f0f5ff',
  },
  'ant-design-vue': {
    icon: 'tabler:components',
    color: '#1677ff',
    bg: '#e6f4ff',
  },
  axios: {
    icon: 'tabler:cloud-data-connection',
    color: '#cf1322',
    bg: '#fff1f0',
  },
}

export function getModuleBrand(id: string): ModuleBrand {
  return BRANDS[id] ?? FALLBACK
}
