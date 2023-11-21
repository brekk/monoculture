import { curry } from 'ramda'
import gitlog from 'gitlog'
import { Future } from 'fluture'

export const NO_OP = () => {}

export const logWithCancel = curry((cancel, opts) =>
  Future((bad, good) => {
    gitlog(opts, (e, data) => (e ? bad(e) : good(data)))
    return cancel
  })
)

export const log = logWithCancel(NO_OP)
