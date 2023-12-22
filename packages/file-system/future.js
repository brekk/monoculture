import { curry, curryN } from 'ramda'
import { Future } from 'fluture'

export const passFailCallbackWithArityAndCancel = curry((cancel, arity, fn) =>
  curryN(arity, function passfail(...args) {
    return new Future((bad, good) => {
      const newArgs = [...args, e => (e ? bad(false) : good(true))]
      fn.apply(this, newArgs)
      return cancel
    })
  })
)

export const passFailCallbackWithArity = passFailCallbackWithArityAndCancel(
  () => {}
)
