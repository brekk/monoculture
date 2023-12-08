import {
  last,
  filter,
  init,
  propOr,
  __ as $,
  add,
  always as K,
  curry,
  replace,
  equals,
  findIndex,
  ifElse,
  join,
  map,
  pipe,
  slice,
  split,
  match,
  trim,
} from 'ramda'
import { fork } from 'fluture'
import { flexecaWithCanceller } from 'file-system'
import { trace } from 'xtrace'

const words = split(' ')
const unwords = join(' ')
const lines = split('\n')
const unlines = join('\n')

// with word splitting
// map(pipe(words, map(trim))),
// map(list =>
// pipe(
// findIndex(test(/[0-9a-f]{7}/)),
// ifElse(equals(-1), K(list), pipe(add(1), slice(0, $, list)))
// )(list)
// ),
// map(unwords),

const parser = pipe(
  propOr('', 'stdout'),
  lines,
  trace('uhh'),
  map(replace(/(.*) ([0-9a-f]{7}) (.*)/, '$1 $2')),
  map(words),
  trace('ohhh'),
  map(sliced => {
    const commit = last(sliced)
    const tree = pipe(init, join(' '))(sliced)
    return commit ? { commit, tree } : { tree }
  })
)

export const faithful = curry((cancel, argv) =>
  pipe(
    flexecaWithCanceller(cancel, 'git'),
    map(parser)
  )(['log', '--decorate', '--graph', '--oneline'])
)

export const renderTree = pipe(
  // filter(({ commit }) => commit),
  map(({ commit: c = '', tree: t = '' }) => t + ' ' + c),
  unlines
)

// move this later
pipe(
  map(renderTree),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(faithful(() => {}, process.argv.slice(2)))
