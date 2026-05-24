import { expandTopic, type QuestionDraft } from '../helpers'
import type { LearningLevel } from '../../../src/types/quiz.types'

type LevelDraft = Parameters<typeof expandTopic>[3][LearningLevel]

export interface TopicPack {
  slug: string
  foundation: LevelDraft
  intermediate: LevelDraft
  advanced: LevelDraft
  expert: LevelDraft
  cto: LevelDraft
}

export interface SectionPack {
  id: string
  title: string
  description?: string
  idPrefix: string
  topics: TopicPack[]
}

export function buildSection(pack: SectionPack): {
  id: string
  title: string
  description?: string
  drafts: QuestionDraft[]
} {
  const drafts = pack.topics.flatMap((t) =>
    expandTopic(pack.id, pack.idPrefix, t.slug, {
      foundation: t.foundation,
      intermediate: t.intermediate,
      advanced: t.advanced,
      expert: t.expert,
      cto: t.cto,
    }),
  )
  return { id: pack.id, title: pack.title, description: pack.description, drafts }
}

export interface ModuleExpansion {
  moduleId: string
  sections: ReturnType<typeof buildSection>[]
  bySection?: Record<string, QuestionDraft[]>
}
