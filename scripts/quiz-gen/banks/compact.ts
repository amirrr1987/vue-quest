import { multi, single, tf, type QuestionDraft } from '../helpers'
import type { LearningLevel } from '../../../src/types/quiz.types'
import { expandTopic } from '../helpers'
import { buildSection, type ModuleExpansion, type SectionPack, type TopicPack } from './build'

export type CompactQ =
  | {
      kind: 'single'
      text: string
      correct: string
      options: [id: string, text: string][]
      explanation: string
    }
  | {
      kind: 'multi'
      text: string
      correct: string[]
      options: [id: string, text: string][]
      explanation: string
    }
  | {
      kind: 'tf'
      text: string
      correct: boolean
      explanation: string
    }

export type CompactTopic = {
  slug: string
  foundation: CompactQ
  intermediate: CompactQ
  advanced: CompactQ
  expert: CompactQ
  cto: CompactQ
}

function toLevelDraft(q: CompactQ) {
  if (q.kind === 'single') {
    const opts = q.options.map(([id, text]) => [id, text, id === q.correct] as const)
    return single(q.text, opts, q.explanation)
  }
  if (q.kind === 'multi') {
    const opts = q.options.map(([id, text]) => [id, text, q.correct.includes(id)] as const)
    return multi(q.text, opts, q.explanation)
  }
  return tf(q.text, q.correct, q.explanation)
}

export function compactToTopicPack(t: CompactTopic): TopicPack {
  return {
    slug: t.slug,
    foundation: toLevelDraft(t.foundation),
    intermediate: toLevelDraft(t.intermediate),
    advanced: toLevelDraft(t.advanced),
    expert: toLevelDraft(t.expert),
    cto: toLevelDraft(t.cto),
  }
}

export function sectionFromCompact(pack: Omit<SectionPack, 'topics'> & { topics: CompactTopic[] }): SectionPack {
  return { ...pack, topics: pack.topics.map(compactToTopicPack) }
}

export function draftsFromCompactTopics(
  sectionId: string,
  idPrefix: string,
  topics: CompactTopic[],
): QuestionDraft[] {
  return topics.flatMap((t) => {
    const pack = compactToTopicPack(t)
    return expandTopic(sectionId, idPrefix, pack.slug, {
      foundation: pack.foundation,
      intermediate: pack.intermediate,
      advanced: pack.advanced,
      expert: pack.expert,
      cto: pack.cto,
    })
  })
}

export function moduleFromSections(
  moduleId: string,
  sections: (Omit<SectionPack, 'topics'> & { topics: CompactTopic[] })[],
  bySection?: Record<string, CompactTopic[]>,
): ModuleExpansion {
  const builtSections = sections.map((s) => buildSection(sectionFromCompact(s)))
  const bySectionDrafts: Record<string, QuestionDraft[]> = {}
  if (bySection) {
    for (const [secId, topics] of Object.entries(bySection)) {
      bySectionDrafts[secId] = draftsFromCompactTopics(secId, moduleId.slice(0, 4), topics)
    }
  }
  return { moduleId, sections: builtSections, bySection: bySectionDrafts }
}
