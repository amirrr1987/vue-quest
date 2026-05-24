import type { CompactQ, CompactTopic } from '../compact'
import { cs, cm, ct } from './_helpers'

/** single: [q, correct, [wrong...], expl] — multi: [q, "a|b", [optC, optD wrong labels], expl] with opts a,b fixed correct */
type S = [string, string, string[], string]

function singleS([text, correct, wrongs, explanation]: S): CompactQ {
  const options: [string, string][] = [['a', correct], ['b', wrongs[0]], ['c', wrongs[1]]]
  if (wrongs[2]) options.push(['d', wrongs[2]])
  return cs(text, 'a', options, explanation)
}

function multiS([text, correctIds, labels, explanation]: S): CompactQ {
  const ids = correctIds.split('|')
  const opts: [string, string][] = [
    ['a', labels[0] ?? 'گزینه الف'],
    ['b', labels[1] ?? 'گزینه ب'],
    ['c', labels[2] ?? 'گزینه ج'],
    ['d', labels[3] ?? 'گزینه د'],
  ]
  return cm(text, ids, opts, explanation)
}

function tfS([text, trueOrFalse, , explanation]: S): CompactQ {
  return ct(text, trueOrFalse === 'true', explanation)
}

export function topic(
  slug: string,
  l: { f: S; i: S; a: S; e: S; c: S },
  shape: { i?: 'multi'; a?: 'single' | 'tf'; e?: 'multi' } = {},
): CompactTopic {
  return {
    slug,
    foundation: singleS(l.f),
    intermediate: shape.i === 'multi' ? multiS(l.i) : singleS(l.i),
    advanced: shape.a === 'single' ? singleS(l.a) : tfS(l.a),
    expert: shape.e === 'multi' ? multiS(l.e) : singleS(l.e),
    cto: singleS(l.c),
  }
}
