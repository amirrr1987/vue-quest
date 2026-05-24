import type { LearningLevel, Question, QuestionType, QuizModule, QuizSection } from '../../src/types/quiz.types'

export const LEVELS: LearningLevel[] = [
  'foundation',
  'intermediate',
  'advanced',
  'expert',
  'cto',
]

export type Opt = [id: string, text: string, correct?: boolean]

export interface QuestionDraft {
  sectionId: string
  idPrefix: string
  slug: string
  level: LearningLevel
  type: QuestionType
  text: string
  options: Opt[]
  explanation: string
}

export function single(text: string, options: Opt[], explanation: string): Omit<QuestionDraft, 'sectionId' | 'idPrefix' | 'slug' | 'level'> & { type: 'single' } {
  return { type: 'single', text, options, explanation }
}

export function multi(text: string, options: Opt[], explanation: string): Omit<QuestionDraft, 'sectionId' | 'idPrefix' | 'slug' | 'level'> & { type: 'multi' } {
  return { type: 'multi', text, options, explanation }
}

export function tf(
  text: string,
  correctIsTrue: boolean,
  explanation: string,
): Omit<QuestionDraft, 'sectionId' | 'idPrefix' | 'slug' | 'level'> & { type: 'trueFalse' } {
  return {
    type: 'trueFalse',
    text,
    options: [
      ['true', 'درست', correctIsTrue],
      ['false', 'نادرست', !correctIsTrue],
    ],
    explanation,
  }
}

export function draftToQuestion(d: QuestionDraft): Question {
  const correctIds = d.options.filter(([, , c]) => c).map(([id]) => id)

  const options =
    d.type === 'trueFalse'
      ? [
          { id: 'true', text: 'درست' },
          { id: 'false', text: 'نادرست' },
        ]
      : d.options.map(([id, text]) => ({ id, text }))

  return {
    id: `${d.idPrefix}-${d.slug}-${d.level}`,
    type: d.type,
    level: d.level,
    text: d.text,
    options,
    correctIds,
    explanation: d.explanation,
  }
}

export function expandTopic(
  sectionId: string,
  idPrefix: string,
  slug: string,
  byLevel: Partial<Record<LearningLevel, Omit<QuestionDraft, 'sectionId' | 'idPrefix' | 'slug' | 'level'>>>,
): QuestionDraft[] {
  return LEVELS.filter((level) => byLevel[level]).map((level) => ({
    sectionId,
    idPrefix,
    slug,
    level,
    ...byLevel[level]!,
  }))
}

export function mergeModule(
  base: QuizModule,
  extraSections: { id: string; title: string; description?: string; drafts: QuestionDraft[] }[],
  extraDraftsBySection: Record<string, QuestionDraft[]>,
): QuizModule {
  const sectionMap = new Map<string, QuizSection>()
  for (const s of base.sections) {
    sectionMap.set(s.id, { ...s, questions: [...s.questions] })
  }

  for (const sec of extraSections) {
    if (!sectionMap.has(sec.id)) {
      sectionMap.set(sec.id, {
        id: sec.id,
        title: sec.title,
        description: sec.description,
        questions: [],
      })
    }
    const section = sectionMap.get(sec.id)!
    const existingIds = new Set(section.questions.map((q) => q.id))
    for (const d of sec.drafts) {
      const q = draftToQuestion(d)
      if (!existingIds.has(q.id)) {
        section.questions.push(q)
        existingIds.add(q.id)
      }
    }
  }

  for (const [sectionId, drafts] of Object.entries(extraDraftsBySection)) {
    if (!sectionMap.has(sectionId)) continue
    const section = sectionMap.get(sectionId)!
    const existingIds = new Set(section.questions.map((q) => q.id))
    for (const d of drafts) {
      const q = draftToQuestion(d)
      if (!existingIds.has(q.id)) {
        section.questions.push(q)
        existingIds.add(q.id)
      }
    }
  }

  const sections = [...sectionMap.values()]
  for (const s of sections) {
    s.questions.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.id.localeCompare(b.id))
  }

  return { ...base, sections }
}

export function countQuestions(mod: QuizModule): number {
  return mod.sections.reduce((n, s) => n + s.questions.length, 0)
}
