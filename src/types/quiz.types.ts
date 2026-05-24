export type QuestionType = 'single' | 'multi' | 'trueFalse'

export type LearningLevel =
  | 'foundation'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'cto'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  level: LearningLevel
  text: string
  options?: QuestionOption[]
  correctIds: string[]
  explanation: string
}

export interface QuizSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export interface QuizModule {
  id: string
  title: string
  description: string
  order: number
  sections: QuizSection[]
}

export interface ModuleCatalogEntry {
  id: string
  title: string
  file: string
  order: number
}

export interface ModulesCatalog {
  modules: ModuleCatalogEntry[]
}

export type SectionKey = `${string}:${string}`

export function makeSectionKey(moduleId: string, sectionId: string): SectionKey {
  return `${moduleId}:${sectionId}`
}
