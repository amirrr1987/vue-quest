import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/quiz.types'
import {
  areAnswersCorrect,
  validateQuestion,
  validateQuizModule,
} from '@/utils/quiz-validation'

const baseQuestion: Question = {
  id: 'q1',
  type: 'single',
  level: 'foundation',
  text: 'سوال تست',
  options: [
    { id: 'a', text: 'الف' },
    { id: 'b', text: 'ب' },
  ],
  correctIds: ['a'],
  explanation: 'توضیح',
}

describe('validateQuestion', () => {
  it('accepts valid single question', () => {
    expect(validateQuestion(baseQuestion, 'q1')).toHaveLength(0)
  })

  it('rejects multi with one correct answer', () => {
    const q: Question = {
      ...baseQuestion,
      id: 'q2',
      type: 'multi',
      correctIds: ['a'],
    }
    expect(validateQuestion(q, 'q2').length).toBeGreaterThan(0)
  })
})

describe('validateQuizModule', () => {
  it('detects duplicate question ids', () => {
    const errors = validateQuizModule({
      id: 'test',
      title: 'تست',
      description: 'تست',
      order: 1,
      sections: [
        {
          id: 's1',
          title: 'بخش',
          questions: [baseQuestion, { ...baseQuestion }],
        },
      ],
    })
    expect(errors.some((e) => e.message.includes('تکراری'))).toBe(true)
  })
})

describe('areAnswersCorrect', () => {
  it('compares single answer', () => {
    expect(areAnswersCorrect(baseQuestion, ['a'])).toBe(true)
    expect(areAnswersCorrect(baseQuestion, ['b'])).toBe(false)
  })

  it('compares multi answers order-independently', () => {
    const q: Question = {
      ...baseQuestion,
      type: 'multi',
      correctIds: ['a', 'b'],
    }
    expect(areAnswersCorrect(q, ['b', 'a'])).toBe(true)
    expect(areAnswersCorrect(q, ['a'])).toBe(false)
  })
})
