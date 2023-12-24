// import * as Q from 'remeda'
import { curry } from 'ramda'

interface Transformer {
  <F, T>(arg: F): T
}

export const equalishBy = curry(
  <F, T>(transform: Transformer, expected: T, x: F): boolean =>
    transform(x) === expected
)
