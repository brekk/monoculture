#!/usr/bin/env node
const path = require('path')
const PKG = require(path.resolve(__dirname, '../../package.json'))
const { argv } = require('node:process')
const { parallel } = require('fluture')
const {
  keys,
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

const REPO = 'https://github.com/brekk/monoculture/tree/main'

const depUsage = curry(({ repo, project }, deps, devDeps) =>
  pipe(
    toPairs,
    map(
      ([k, v]) =>
        (v.startsWith('workspace:')
          ? `[${k}](${repo}/${v.slice(v.indexOf(':') + 1)}) 🦴`
          : `[${k}](https://www.npmjs.com/package/${k})`) +
        (keys(devDeps).includes(k) ? '🧪' : '')
    ),
    join('\n      - ')
  )({ ...deps, ...devDeps })
)

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
            map(
              pipe(z => [
                z.group,
                z.name,
                z.description,
                z.dependencies,
                z.devDependencies,
              ])
            ),
            groupBy(head),
            map(map(([_k, v, d, deps, devDeps]) => [v, d, deps, devDeps]))
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
                  ([project, summary, deps, devDeps]) =>
                    `[${project}](${repo}/${group}/${project}) - ${summary}${
                      argv.includes('--show-deps') &&
                      keys({ ...deps, ...devDeps }).length > 0
                        ? `\n\n     <details><summary>Dependencies</summary>\n\n      - ${depUsage(
                            { repo, project },
                            deps,
                            devDeps
                          )}\n\n     </details>`
                        : '\n'
                    }`
                ),
                projects =>
                  `\n## ${group}\n\n${projects
                    .map(z => '   * ' + z)
                    .join('\n')}`
              )(list)
            )
          ),
          map(unlines)
        )(raw)
    )
  )(package)
)

fork(console.warn)(console.log)(summarize(REPO, PKG, argv.slice(2)))
