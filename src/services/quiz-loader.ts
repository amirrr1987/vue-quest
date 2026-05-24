import catalog from '@/data/modules.json'
import type {
  ModuleCatalogEntry,
  ModulesCatalog,
  Question,
  QuizModule,
  QuizSection,
} from '@/types/quiz.types'
import { validateQuizModule } from '@/utils/quiz-validation'

const questionModules = import.meta.glob<{ default: QuizModule }>(
  '@/data/questions/*.json',
  { eager: true },
)

function filePathToModuleId(path: string): string {
  const match = path.match(/\/([^/]+)\.json$/)
  return match?.[1] ?? path
}

const modulesById = new Map<string, QuizModule>()

for (const [path, mod] of Object.entries(questionModules)) {
  const raw = mod as { default?: QuizModule } & QuizModule
  const data = raw.default ?? raw
  const fileId = filePathToModuleId(path)
  modulesById.set(data.id, data)
  if (fileId !== data.id) {
    modulesById.set(fileId, data)
  }

  const validationErrors = validateQuizModule(data)
  if (validationErrors.length > 0 && import.meta.env.DEV) {
    console.warn(`[quiz-loader] validation errors in ${path}:`, validationErrors)
  }
}

const catalogData = catalog as ModulesCatalog

export function getModuleCatalog(): ModuleCatalogEntry[] {
  return [...catalogData.modules].sort((a, b) => a.order - b.order)
}

export function getQuizModule(moduleId: string): QuizModule | undefined {
  return modulesById.get(moduleId)
}

export function getAllQuizModules(): QuizModule[] {
  return getModuleCatalog()
    .map((entry) => getQuizModule(entry.id))
    .filter((m): m is QuizModule => m !== undefined)
}

export function getSection(
  moduleId: string,
  sectionId: string,
): QuizSection | undefined {
  const mod = getQuizModule(moduleId)
  return mod?.sections.find((s) => s.id === sectionId)
}

export function getQuestionById(
  moduleId: string,
  questionId: string,
): Question | undefined {
  const mod = getQuizModule(moduleId)
  if (!mod) return undefined

  for (const section of mod.sections) {
    const question = section.questions.find((q) => q.id === questionId)
    if (question) return question
  }
  return undefined
}

export function getQuestionsForSection(
  moduleId: string,
  sectionId: string,
): Question[] {
  return getSection(moduleId, sectionId)?.questions ?? []
}
