import { Future } from 'fluture'
import { curry } from 'ramda'

export const cancellableTask = curry((cancel, fn, args) => {
  return Future((bad, good) => {
    try {
      const value = fn(...args)
      good(value)
    } catch (e) {
      bad(e)
    }
    return cancel
  })
})

export const cancelSilently = () => {}

export const unaryWithCancel = curry((cancel, fn, x) =>
  cancellableTask(cancel, fn, [x])
)
export const unary = unaryWithCancel(cancelSilently)

export const binaryWithCancel = curry((cancel, fn, x, y) =>
  cancellableTask(cancel, fn, [x, y])
)
export const binary = binaryWithCancel(cancelSilently)

export const tertiaryWithCancel = curry((cancel, fn, x, y, z) =>
  cancellableTask(cancel, fn, [x, y, z])
)
export const tertiary = tertiaryWithCancel(cancelSilently)
