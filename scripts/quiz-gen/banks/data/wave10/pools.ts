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
} from '../wave2/seeds'
import type { ConceptSeed } from '../wave2/auto-topic'
import { expandAxiosPool } from './axios-pool'

function expandPool(pool: ConceptSeed[], target: number): ConceptSeed[] {
  if (pool.length >= target) return pool
  const out = [...pool]
  let i = 0
  while (out.length < target) {
    const b = pool[i % pool.length]!
    const n = out.length
    out.push({
      ...b,
      slug: `${b.slug}-v${n}`,
      name: `${b.name} · نسخه ${n + 1}`,
      note: `${b.note} (variant ${n + 1})`,
    })
    i++
  }
  return out
}

const BASE: Record<string, ConceptSeed[]> = {
  javascript: javascriptSeeds,
  typescript: typescriptSeeds,
  vue: vueSeeds,
  pinia: piniaSeeds,
  'vue-router': vueRouterSeeds,
  'vueuse-core': vueuseCoreSeeds,
  'vueuse-head': vueuseHeadSeeds,
  'vueuse-router': vueuseRouterSeeds,
  'ant-design-vue': antDesignVueSeeds,
  axios: expandAxiosPool(100),
}

export function getPoolForModule(moduleId: string, minPool = 80): ConceptSeed[] {
  const base = BASE[moduleId]
  if (!base?.length) throw new Error(`no concept pool for ${moduleId}`)
  return expandPool(base, minPool)
}
