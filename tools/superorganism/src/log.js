import { curry, __ as $, identity as I } from 'ramda'

export const scopedBinaryEffect = curry(
  function _scopedBinaryEffect(effect, scope, a, b) {
    effect(a, scope(b))
    return b
  }
)

export const binaryEffect = scopedBinaryEffect($, I)

// eslint-disable-next-line no-console
export const trace = binaryEffect(console.log)
