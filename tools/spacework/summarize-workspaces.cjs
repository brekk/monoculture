#!/usr/bin/env node
const path = require('path')
const PKG = require(path.resolve(__dirname, '../../package.json'))
const { argv: PROCESS_ARGS } = require('node:process')
const { parallel } = require('fluture')
const {
  filter,
  find,
  equals,
  $,
  F,
  always: K,
  any,
  chain,
  concat,
  curry,
  flatten,
  fork,
  groupBy,
  head,
  identity: I,
  ifElse,
  j2,
  join,
  keys,
  map,
  pipe,
  propOr,
  readDirWithConfig,
  readFile,
  reduce,
  resolve,
  slice,
  sort,
  tap,
  toPairs,
  trace,
  when,
} = require('snang/script')
const unwords = join(' ')
const unlines = join('\n')

const REPO = 'https://github.com/brekk/monoculture/tree/main'

const COM = 'github.com'
const TREE = 'tree/main'
const pagesForGithub = z =>
  `https://` + z.slice(z.indexOf(COM), z.indexOf(TREE) - 1)

const depUsage = curry(({ repo, project }, deps, devDeps) =>
  pipe(
    toPairs,
    map(
      ([k, v]) =>
        (v.startsWith('workspace:')
          ? `[${k}](${repo}/${v.slice(v.indexOf(':') + 1)}) 🦴`
          : `[${k}](https://www.npmjs.com/package/${k})`) +
        (keys(devDeps).includes(k) ? ' 🧪' : '')
    ),
    join('\n      - ')
  )({ ...deps, ...devDeps })
)

const summarize = curry((repo, package, docWorkspace, argv) => {
  const isReadme = argv.includes('--readme')
  const showDependencies = argv.includes('--show-deps')
  return pipe(
    propOr([], 'workspaces'),

    map(readDirWithConfig({ onlyDirectories: true })),
    F.parallel(10),
    map(reduce(concat, [])),
    chain(workspaces => {
      const matched = find(equals(docWorkspace), workspaces)
      return matched
        ? pipe(
            readFile,
            map(JSON.parse),
            map(drGen => ({ drGen, workspaces }))
          )(matched + '/dr-generated.json')
        : resolve({ drGen: [], workspaces })
    }),
    chain(({ workspaces, drGen }) =>
      pipe(
        map(pathName =>
          pipe(
            z => path.join(z, 'package.json'),
            readFile,
            map(JSON.parse),
            map(raw => ({
              ...raw,
              group: pathName.slice(0, pathName.indexOf('/')),
              documentation: filter(
                doc => doc.filename.startsWith(pathName),
                drGen
              ),
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
                z.documentation,
              ])
            ),
            groupBy(head),
            map(
              map(([_k, v, d, deps, devDeps, docs]) => [
                v,
                d,
                deps,
                devDeps,
                docs,
              ])
            )
          )
        )
      )(workspaces)
    ),
    when(
      () => isReadme,
      raw =>
        pipe(
          map(toPairs),
          map(
            map(([group, list]) =>
              pipe(
                map(
                  ([project, summary, deps, devDeps, docs]) =>
                    `[${project}](${repo}/${group}/${project}) - ${summary}${
                      showDependencies &&
                      keys({ ...deps, ...devDeps }).length > 0
                        ? `\n${
                            docs.length
                              ? `\n     [Documentation](${pagesForGithub(
                                  repo
                                )}/${group}/${project})\n`
                              : ''
                          }\n     <details><summary>Dependencies</summary>\n\n      - ${depUsage(
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
                    .join(showDependencies ? '\n' : '')}`
              )(list)
            )
          ),
          map(unlines)
        )(raw)
    )
  )(package)
})
// eslint-disable-next-line no-console
fork(console.warn)(console.log)(
  summarize(REPO, PKG, 'apps/docs', PROCESS_ARGS.slice(2))
)
