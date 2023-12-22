import { curry } from 'ramda'
import { Future } from 'fluture'

const _tree = curry((conf, path) => {})

export const treeWithCancel = curry((cancel, conf, path) =>
  Future((bad, good) => {
    good(_tree(conf, path))
    return cancel
  })
)
