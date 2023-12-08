import { curry } from 'ramda'
import GLOG from 'gitlog'
import { Future } from 'fluture'
const glog = GLOG.default || GLOG

export const NO_OP = () => {}

export const gitlogWithCancel = curry((cancel, opts) =>
  Future((bad, good) => {
    glog(opts, (e, data) => (e ? bad(e) : good(data)))
    return cancel
  })
)

export const gitlog = gitlogWithCancel(NO_OP)
