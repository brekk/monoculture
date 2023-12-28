import { Future } from 'fluture'
import { curry } from 'ramda'
import { findUp as __findUp } from 'find-up'

export const digUpWithCancel = curry((cancel, opts, x) =>
  Future((bad, good) => {
    __findUp(x, opts)
      .catch(bad)
      .then(raw => (raw ? good(raw) : bad(new Error('No config file found!'))))
    return cancel
  })
)
export const digUp = digUpWithCancel(() => {})
