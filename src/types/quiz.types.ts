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

export type QuizMode = 'normal' | 'wrong'

/**
 * تاریخچه یک پاسخ در طول جلسه — سبک‌ترین حالت ممکن.
 * فقط ids ذخیره می‌شود تا حجم localStorage و memory حداقل باشد.
 */
/** id ثابت برای گزینه «نمی‌دانم» — هرگز نباید با id واقعی گزینه‌ها تداخل کند. */
export const SKIP_OPTION_ID = '__skip__'

export interface SessionAnswer {
  selectedIds: string[]
  correct: boolean
  /** کاربر «نمی‌دانم» زده — غلط ثبت می‌شود ولی UX متفاوت نشان می‌دهد */
  skipped?: boolean
}

/**
 * Active session — تنها یک نمونه در هر لحظه در localStorage نگه‌داری می‌شود.
 * این جدا از stats دائمی است تا I/O کم و قابل drop شدن باشد.
 */
export interface ActiveSession {
  moduleId: string
  sectionId: string
  mode: QuizMode
  level: LearningLevel | null
  /** ترتیب سوالات این جلسه — فقط ids */
  queue: string[]
  currentIndex: number
  /** پاسخ‌های ثبت‌شده در همین جلسه (برای review و resume) */
  history: Record<string, SessionAnswer>
  startedAt: number
  updatedAt: number
}
