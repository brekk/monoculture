#!/usr/bin/env node
const path = require('path')
const PKG = require(path.resolve(__dirname, '../../package.json'))
const { argv } = require('node:process')
const { parallel } = require('fluture')
const {
  when,
  join,
  ifElse,
  toPairs,
  always: K,
  head,
  groupBy,
  $,
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
  readFile,
  F,
} = require('snang/script')
const unwords = join(' ')
const unlines = join('\n')

const summarize = curry((repo, package, args) =>
  pipe(
    propOr([], 'workspaces'),
    map(readDirWithConfig({ onlyDirectories: true })),
    F.parallel(10),
    map(reduce(concat, [])),
    chain(
      pipe(
        map(pathName =>
          pipe(
            z => path.join(z, 'package.json'),
            readFile,
            map(JSON.parse),
            map(raw => ({
              ...raw,
              group: pathName.slice(0, pathName.indexOf('/')),
            }))
          )(pathName)
        ),
        parallel(10),
        map(
          pipe(
            map(pipe(z => [z.group, z.name, z.description])),
            groupBy(head),
            map(map(([k, v, d]) => [v, d]))
          )
        )
      )
    ),
    when(
      () => argv.includes('--readme'),
      raw =>
        pipe(
          map(toPairs),
          map(
            map(([group, list]) =>
              pipe(
                map(
                  ([project, summary]) =>
                    `[${project}](${repo}/${group}/${project}) - ${summary}`
                ),
                projects =>
                  `## ${group}\n${projects.map(z => '   * ' + z).join('\n')}`
              )(list)
            )
          ),
          map(unlines)
        )(raw)
    )
  )(package)
)

const repo = 'https://github.com/brekk/monoculture/tree/main'
fork(console.warn)(console.log)(summarize(repo, PKG, argv.slice(2)))
