import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QuizModule } from '../../src/types/quiz.types'
import { validateQuizModule } from '../../src/utils/quiz-validation'
import { countQuestions, mergeModule } from './helpers'
import { expansions } from './banks'
import { wave2Expansions } from './banks/wave2'
import { buildWave10Expansions } from './banks/wave10'

const allExpansions = [...expansions, ...wave2Expansions, ...buildWave10Expansions()]

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const questionsDir = join(root, 'src/data/questions')

function loadModule(id: string): QuizModule {
  const path = join(questionsDir, `${id}.json`)
  return JSON.parse(readFileSync(path, 'utf-8')) as QuizModule
}

function writeModule(mod: QuizModule): void {
  const path = join(questionsDir, `${mod.id}.json`)
  writeFileSync(path, `${JSON.stringify(mod, null, 2)}\n`, 'utf-8')
}

const report: string[] = []
const finalCounts = new Map<string, number>()

for (const exp of allExpansions) {
  const moduleId = exp.moduleId
  const basePath = join(questionsDir, `${moduleId}.json`)
  const base = existsSync(basePath) ? loadModule(moduleId) : null
  const before = base ? countQuestions(base) : 0
  const merged = mergeModule(
    base ?? {
      id: moduleId,
      title: moduleId,
      description: '',
      order: 99,
      sections: [],
    },
    exp.sections,
    exp.bySection ?? {},
  )
  const after = countQuestions(merged)
  const errors = validateQuizModule(merged)
  if (errors.length > 0) {
    console.error(`Validation failed for ${moduleId}:`, errors.slice(0, 8))
    process.exit(1)
  }
  writeModule(merged)
  finalCounts.set(moduleId, after)
  const mult = before > 0 ? (after / before).toFixed(1) : 'new'
  report.push(`${moduleId}: ${before} → ${after} (${mult}x)`)
}

const total = [...finalCounts.values()].reduce((a, b) => a + b, 0)
console.log('Quiz expansion complete:\n' + report.join('\n'))
console.log(`\nTotal questions: ${total}`)
