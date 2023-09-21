import { Future } from 'fluture'
import { curry } from 'ramda'

const barfInSpace = () => {}

export const unaryWithCancel = curry(
  (cancel, fn, x) =>
    new Future((bad, good) => {
      try {
        good(fn(x))
        return cancel
      } catch (e) {
        bad(e)
      }
    })
)
export const unary = unaryWithCancel(barfInSpace)

export const binaryWithCancel = curry(
  (cancel, fn, x, y) =>
    new Future((bad, good) => {
      try {
        good(fn(x, y))
        return cancel
      } catch (e) {
        bad(e)
      }
    })
)
export const binary = binaryWithCancel(barfInSpace)

export const tertiaryWithCancel = curry(
  (cancel, fn, x, y, z) =>
    new Future((bad, good) => {
      try {
        good(fn(x, y, z))
        return cancel
      } catch (e) {
        bad(e)
      }
    })
)

export const tertiary = tertiaryWithCancel(barfInSpace)
