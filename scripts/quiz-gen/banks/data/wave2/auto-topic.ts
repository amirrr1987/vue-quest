import type { CompactTopic } from '../../compact'
import { topic } from '../mk'

export interface ConceptSeed {
  slug: string
  name: string
  /** پاسخ درست سطح پایه */
  foundation: string
  /** پاسخ درست سطح میانی */
  intermediate: string
  /** عبارت true/false برای سطح advanced — true یا false */
  advancedTrue: boolean
  /** جمله سطح advanced */
  advancedStatement: string
  /** دو گزینه درست expert (متن گزینه a و b) */
  expertA: string
  expertB: string
  /** پاسخ درست CTO */
  cto: string
  /** توضیح کوتاه هر سطح */
  note: string
}

const wrongPool = [
  'فقط در مرورگرهای خیلی قدیمی',
  'جایگزین کامل TypeScript',
  'بدون ارتباط با Vue',
  'فقط برای CSS',
  'همیشه anti-pattern است',
  'فقط در Node.js غیرفعال است',
  'هیچ تأثیری روی perf ندارد',
  'ممنوع در strict mode',
] as const

function pickWrong(seed: string, n: number): string[] {
  const start = seed.length % wrongPool.length
  return Array.from({ length: n }, (_, i) => wrongPool[(start + i) % wrongPool.length]!)
}

export function topicsFromSeeds(
  seeds: ConceptSeed[],
  moduleLabel: string,
): CompactTopic[] {
  return seeds.map((s) => {
    const [w1, w2, w3] = pickWrong(s.slug, 3)
    return topic(
      `w2-${s.slug}`,
      {
        f: [
          `کدام تعریف درباره «${s.name}» در ${moduleLabel} درست است؟`,
          s.foundation,
          [w1, w2],
          s.note,
        ],
        i: [
          `در پروژه واقعی، «${s.name}» بیشتر برای چه استفاده می‌شود؟`,
          s.intermediate,
          [w2, w3],
          s.note,
        ],
        a: [s.advancedStatement, s.advancedTrue ? 'true' : 'false', [], s.note],
        e: [
          `کدام موارد درباره «${s.name}» درست است؟`,
          'a|b',
          [s.expertA, s.expertB, w1, w2],
          s.note,
        ],
        c: [
          `در معماری تیمی ${moduleLabel}، سیاست منطقی برای «${s.name}» چیست؟`,
          s.cto,
          [w3, 'بدون مستندات و هر تیمی هرطور'],
          s.note,
        ],
      },
      { e: 'multi' },
    )
  })
}
