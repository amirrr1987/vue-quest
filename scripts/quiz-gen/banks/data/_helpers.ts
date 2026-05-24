import type { CompactQ } from '../compact'

export const cs = (
  text: string,
  correct: string,
  options: [string, string][],
  explanation: string,
): CompactQ => ({ kind: 'single', text, correct, options, explanation })

export const cm = (
  text: string,
  correct: string[],
  options: [string, string][],
  explanation: string,
): CompactQ => ({ kind: 'multi', text, correct, options, explanation })

export const ct = (text: string, correct: boolean, explanation: string): CompactQ => ({
  kind: 'tf',
  text,
  correct,
  explanation,
})
