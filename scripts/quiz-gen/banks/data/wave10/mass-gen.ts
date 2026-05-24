import type { CompactTopic } from '../../compact'
import { topic } from '../mk'
import type { ConceptSeed } from '../wave2/auto-topic'

const ANGLES = [
  'در پروژه production',
  'هنگام دیباگ',
  'در code review',
  'برای perf',
  'از نظر امنیت',
  'با TypeScript',
  'در تست واحد',
  'در SSR',
  'در monorepo',
  'برای onboarding',
] as const

const WRONG = [
  'همیشه sync است',
  'فقط در Vue 2',
  'جایگزین HTTP است',
  'بدون نیاز به config',
  'مربوط به CSS است',
  'فقط سمت سرور',
  'ممنوع در strict mode',
  'همان localStorage است',
] as const

function pad(n: number): string {
  return String(n).padStart(5, '0')
}

function pickWrong(i: number, j: number): string {
  return WRONG[(i * 3 + j) % WRONG.length]!
}

/** سوالات یکتا با slug شماره‌ای و زاویه متفاوت */
export function generateMassTopics(
  moduleLabel: string,
  pool: ConceptSeed[],
  count: number,
): CompactTopic[] {
  if (pool.length === 0) throw new Error(`empty pool for ${moduleLabel}`)
  const topics: CompactTopic[] = []
  for (let i = 0; i < count; i++) {
    const base = pool[i % pool.length]!
    const angle = ANGLES[i % ANGLES.length]!
    const slug = `w10-${pad(i)}`
    const tag = `#${i + 1}`
    const [w1, w2, w3] = [pickWrong(i, 0), pickWrong(i, 1), pickWrong(i, 2)]
    topics.push(
      topic(
        slug,
        {
          f: [
            `${angle}، کدام گزینه درباره «${base.name}» در ${moduleLabel} درست است؟ (${tag})`,
            base.foundation,
            [w1, w2],
            `${base.note} — تمرکز: مبانی.`,
          ],
          i: [
            `سناریوی میانی: «${base.name}» در ${moduleLabel} معمولاً چه کمکی می‌کند؟ (${tag})`,
            base.intermediate,
            [w2, w3],
            `${base.note} — تمرکز: کاربرد.`,
          ],
          a: [
            `${base.advancedStatement} (${moduleLabel} / ${tag})`,
            base.advancedTrue ? 'true' : 'false',
            [],
            `${base.note} — تمرکز: پیشرفته.`,
          ],
          e: [
            `کدام‌ها درباره «${base.name}» صحیح‌اند؟ (${angle} · ${tag})`,
            'a|b',
            [base.expertA, base.expertB, w1, w2],
            `${base.note} — تمرکز: expert.`,
          ],
          c: [
            `سیاست تیمی ${angle} برای «${base.name}» در ${moduleLabel}؟ (${tag})`,
            base.cto,
            [w3, 'بدون guideline و ad-hoc'],
            `${base.note} — تمرکز: CTO.`,
          ],
        },
        { e: 'multi' },
      ),
    )
  }
  return topics
}

export function chunkTopicsIntoSections(
  sectionIdPrefix: string,
  titlePrefix: string,
  idPrefix: string,
  topics: CompactTopic[],
  chunkSize = 60,
): { id: string; title: string; description?: string; idPrefix: string; topics: CompactTopic[] }[] {
  const sections: {
    id: string
    title: string
    description?: string
    idPrefix: string
    topics: CompactTopic[]
  }[] = []
  for (let i = 0; i < topics.length; i += chunkSize) {
    const part = Math.floor(i / chunkSize) + 1
    sections.push({
      id: `${sectionIdPrefix}-${part}`,
      title: `${titlePrefix} · بخش ${part}`,
      description: `سوالات تولیدشده — بخش ${part}`,
      idPrefix,
      topics: topics.slice(i, i + chunkSize),
    })
  }
  return sections
}
