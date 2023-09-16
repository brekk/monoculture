const pkg = require('../package.json')
const { argv } = require('node:process')
const {
  reduce,
  flatten,
  concat,
  sort,
  chain,
  propOr,
  slice,
  resolve,
  readDirWithConfig,
  pipe,
  curry,
  map,
  trace,
  fork,
  F,
} = require('snang/script')

pipe(
  F.resolve,
  map(
    pipe(
      propOr([], 'workspaces'),
      map(readDirWithConfig({ onlyDirectories: true }))
    )
  ),
  chain(F.parallel(10)),
  map(reduce(concat, [])),
  // map(trace('nice')),
  fork(console.warn)(console.log)
)(pkg)
