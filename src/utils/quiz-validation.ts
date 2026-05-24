import type { Question, QuizModule } from '@/types/quiz.types'

export interface ValidationError {
  path: string
  message: string
}

export function validateQuestion(question: Question, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!question.id?.trim()) {
    errors.push({ path, message: 'شناسه سوال الزامی است' })
  }

  if (!question.text?.trim()) {
    errors.push({ path, message: 'متن سوال الزامی است' })
  }

  if (!question.explanation?.trim()) {
    errors.push({ path, message: 'توضیح سوال الزامی است' })
  }

  const correctCount = question.correctIds?.length ?? 0

  if (question.type === 'single' || question.type === 'trueFalse') {
    if (correctCount !== 1) {
      errors.push({
        path,
        message: `سوال ${question.type} باید دقیقاً یک پاسخ صحیح داشته باشد`,
      })
    }
  }

  if (question.type === 'multi') {
    if (correctCount < 2) {
      errors.push({
        path,
        message: 'سوال multi باید حداقل دو پاسخ صحیح داشته باشد',
      })
    }
    if ((question.options?.length ?? 0) < 2) {
      errors.push({ path, message: 'سوال multi باید حداقل دو گزینه داشته باشد' })
    }
  }

  const options = question.options ?? []
  if (question.type !== 'trueFalse' && options.length === 0) {
    errors.push({ path, message: 'گزینه‌های سوال الزامی است' })
  }

  for (const correctId of question.correctIds ?? []) {
    if (options.length > 0 && !options.some((o) => o.id === correctId)) {
      errors.push({
        path,
        message: `پاسخ صحیح "${correctId}" در گزینه‌ها وجود ندارد`,
      })
    }
  }

  return errors
}

export function validateQuizModule(module: QuizModule): ValidationError[] {
  const errors: ValidationError[] = []
  const questionIds = new Set<string>()

  if (!module.id?.trim()) {
    errors.push({ path: 'module', message: 'شناسه ماژول الزامی است' })
  }

  for (const section of module.sections) {
    const sectionPath = `${module.id}/${section.id}`

    for (const question of section.questions) {
      const questionPath = `${sectionPath}/${question.id}`

      if (questionIds.has(question.id)) {
        errors.push({
          path: questionPath,
          message: `شناسه سوال تکراری: ${question.id}`,
        })
      }
      questionIds.add(question.id)

      errors.push(...validateQuestion(question, questionPath))
    }
  }

  return errors
}

export function areAnswersCorrect(
  question: Question,
  selectedIds: string[],
): boolean {
  const correct = [...question.correctIds].sort()
  const selected = [...selectedIds].sort()

  if (correct.length !== selected.length) return false
  return correct.every((id, i) => id === selected[i])
}
