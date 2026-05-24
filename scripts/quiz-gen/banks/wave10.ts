import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QuizModule } from '../../../src/types/quiz.types'
import { countQuestions } from '../helpers'
import { moduleFromSections } from './compact'
import type { ModuleExpansion } from './build'
import { chunkTopicsIntoSections, generateMassTopics } from './data/wave10/mass-gen'
import { getPoolForModule } from './data/wave10/pools'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../../..')
const questionsDir = join(root, 'src/data/questions')

const MODULE_META: Record<
  string,
  { label: string; idPrefix: string; sectionPrefix: string; title: string }
> = {
  javascript: { label: 'JavaScript', idPrefix: 'js10', sectionPrefix: 'js-mass', title: 'JavaScript · مرور انبوه' },
  typescript: { label: 'TypeScript', idPrefix: 'ts10', sectionPrefix: 'ts-mass', title: 'TypeScript · مرور انبوه' },
  vue: { label: 'Vue 3', idPrefix: 'vue10', sectionPrefix: 'vue-mass', title: 'Vue 3 · مرور انبوه' },
  pinia: { label: 'Pinia', idPrefix: 'pin10', sectionPrefix: 'pin-mass', title: 'Pinia · مرور انبوه' },
  'vue-router': { label: 'Vue Router', idPrefix: 'rt10', sectionPrefix: 'rt-mass', title: 'Vue Router · مرور انبوه' },
  'vueuse-core': { label: 'VueUse Core', idPrefix: 'uc10', sectionPrefix: 'uc-mass', title: 'VueUse Core · مرور انبوه' },
  'vueuse-head': { label: 'VueUse Head', idPrefix: 'hd10', sectionPrefix: 'hd-mass', title: 'VueUse Head · مرور انبوه' },
  'vueuse-router': { label: 'VueUse Router', idPrefix: 'ur10', sectionPrefix: 'ur-mass', title: 'VueUse Router · مرور انبوه' },
  'ant-design-vue': {
    label: 'Ant Design Vue',
    idPrefix: 'ad10',
    sectionPrefix: 'ad-mass',
    title: 'Ant Design Vue · مرور انبوه',
  },
  axios: { label: 'Axios', idPrefix: 'ax10', sectionPrefix: 'ax-mass', title: 'Axios · مرور انبوه' },
}

function loadCount(moduleId: string): number {
  const path = join(questionsDir, `${moduleId}.json`)
  if (!existsSync(path)) return 0
  const mod = JSON.parse(readFileSync(path, 'utf-8')) as QuizModule
  return countQuestions(mod)
}

/**
 * تعداد سوال قبل از wave10 — اجرای دوباره اسکریپت دوباره ۱۰× نمی‌کند.
 * axios از صفر به اندازه میانگین دوره‌های دیگر در مقیاس ۱۰× می‌رسد.
 */
const WAVE10_BASELINE: Record<string, number> = {
  javascript: 294,
  typescript: 200,
  vue: 200,
  pinia: 133,
  'vue-router': 133,
  'vueuse-core': 133,
  'vueuse-head': 89,
  'vueuse-router': 89,
  'ant-design-vue': 150,
  axios: 0,
}

const AVG_BASELINE_10X =
  Object.entries(WAVE10_BASELINE)
    .filter(([id]) => id !== 'axios')
    .reduce((sum, [, n]) => sum + n, 0) / 9

function targetFor(moduleId: string): number {
  if (moduleId === 'axios') return Math.round(AVG_BASELINE_10X * 10)
  return (WAVE10_BASELINE[moduleId] ?? 0) * 10
}

export function buildWave10Expansions(): ModuleExpansion[] {
  const expansions: ModuleExpansion[] = []

  for (const moduleId of Object.keys(MODULE_META)) {
    const meta = MODULE_META[moduleId]!
    const current = loadCount(moduleId)
    const target = targetFor(moduleId)
    const needQuestions = target - current
    if (needQuestions <= 0) continue

    const topicCount = Math.ceil(needQuestions / 5)
    const pool = getPoolForModule(moduleId, Math.min(topicCount, 200))
    const topics = generateMassTopics(meta.label, pool, topicCount)
    const sectionPacks = chunkTopicsIntoSections(
      meta.sectionPrefix,
      meta.title,
      meta.idPrefix,
      topics,
      50,
    )

    expansions.push(
      moduleFromSections(
        moduleId,
        sectionPacks.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          idPrefix: s.idPrefix,
          topics: s.topics,
        })),
      ),
    )
  }

  return expansions
}
