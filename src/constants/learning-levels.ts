import type { LearningLevel } from '@/types/quiz.types'

export const LEARNING_LEVELS: LearningLevel[] = [
  'foundation',
  'intermediate',
  'advanced',
  'expert',
  'cto',
]

export const LEARNING_LEVEL_I18N_KEYS: Record<LearningLevel, string> = {
  foundation: 'levelFoundation',
  intermediate: 'levelIntermediate',
  advanced: 'levelAdvanced',
  expert: 'levelExpert',
  cto: 'levelCto',
}
