import {
  last,
  init,
  propOr,
  curry,
  replace,
  join,
  map,
  pipe,
  split,
} from 'ramda'
import { bimap } from 'fluture'
import { execWithCancel } from 'kiddo'

const words = split(' ')
const lines = split('\n')
const unlines = join('\n')

export const parser = pipe(
  lines,
  map(
    pipe(replace(/(.*) ([0-9a-f]{7}) (.*)/, '$1 $2'), words, sliced => {
      const commit = last(sliced)
      const tree = pipe(init, join(' '))(sliced)
      return { commit, tree }
    })
  )
)

export const gitgraph = curry((cancel, argv) =>
  pipe(
    execWithCancel(cancel, 'git'),
    bimap(propOr('', 'stderr'))(propOr('', 'stdout')),
    map(parser)
  )(['log', '--decorate', '--graph', '--oneline', ...argv])
)

export const renderTree = pipe(
  map(({ commit: c = '', tree: t = '' }) => t + ' ' + c),
  unlines
)
