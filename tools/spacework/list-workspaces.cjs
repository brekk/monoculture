#!/usr/bin/env node
const path = require('path')
const pkg = require(path.resolve(__dirname, '../../package.json'))
const { argv } = require('node:process')
const {
  j2,
  identity: I,
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

const NAME_ONLY = (process.argv || []).slice(2)[0] === '--name-only'

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
  NAME_ONLY ? map(map(z => z.slice(z.indexOf('/') + 1))) : I,
  map(j2),
  fork(console.warn)(console.log)
)(pkg)
