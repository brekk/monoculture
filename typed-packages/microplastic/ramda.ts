// so remeda doesn't seem like it actually solves much at first blush

import { curry } from 'ramda'

interface Transformer<F, T> {
  (x: F): T
}

interface EqualishBy<F, T> {
  (t: Transformer<F, T>, expected: T, x: F): boolean
  (t: Transformer<F, T>, expected: T): (x: F) => boolean
  (t: Transformer<F, T>): (expected: T, x: F) => boolean
}

export function equalishBy<F, T>(a: Transformer<F, T>, b: T, c: F) {
  const raw: EqualishBy<F, T> = curry((transform, expected, x) => {
    const t = transform(x)
    return t === expected
  })
  return raw(a, b, c)
}
