#!/usr/bin/env node

// src/index.js
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
import { flexecaWithCanceller } from 'file-system'
const words = split(' ')
const lines = split('\n')
const unlines = join('\n')
const parser = pipe(
  lines,
  map(
    pipe(replace(/(.*) ([0-9a-f]{7}) (.*)/, '$1 $2'), words, sliced => {
      const commit = last(sliced)
      const tree = pipe(init, join(' '))(sliced)
      return { commit, tree }
    })
  )
)
const gitgraph = curry((cancel, argv) =>
  pipe(
    flexecaWithCanceller(cancel, 'git'),
    map(propOr('', 'stdout')),
    map(parser)
  )(['log', '--decorate', '--graph', '--oneline', ...argv])
)
const renderTree = pipe(
  map(({ commit: c = '', tree: t = '' }) => t + ' ' + c),
  unlines
)
export { gitgraph, parser, renderTree }
