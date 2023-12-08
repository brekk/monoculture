#!/usr/bin/env node
const path = require('path')
const pkg = require(path.resolve(__dirname, '../../package.json'))
const { argv } = require('node:process')
const { parallel } = require('fluture')
const {
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

const FOR_README = (process.argv || []).slice(2)[0] === '--readme'

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
  ifElse(
    K(FOR_README),
    raw =>
      pipe(
        map(toPairs),
        map(
          map(([group, list]) =>
            pipe(
              map(
                ([project, summary]) =>
                  `[${project}](https://github.com/brekk/monoculture/tree/main/${group}/${project}) - ${summary}`
              ),
              line => [group, line.map(z => '   * ' + z)]
            )(list)
          )
        )
      )(raw),
    pipe(
      map(([group, list]) => `# ${group}\n\n${list.join('\n')}`),
      map(j2)
    ),
    // map(join('\n')),
    map(j2)
  ),
  fork(console.warn)(console.log)
)(pkg)
