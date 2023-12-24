// so remeda doesn't seem like it actually solves much at first blush

import { curry } from 'ramda'

interface Transformer<F, T> {
  (arg: F): T
}

export interface EqualishBy<F, T> {
  (transform: Transformer<F, T>, expected: T, x: F): boolean
  (transform: Transformer<F, T>, expected: T): (x: F) => boolean
  (transform: Transformer<F, T>): (expected: T, x: F) => boolean
}

export const equalishBy = curry(
  <F, T>(transform: Transformer<F, T>, expected: T, x: F) => {
    console.log('t', transform, 'ex', expected, 'x', x)
    const t = transform(x)
    return t === expected
  }
)
