import { dirname, join as pathJoin } from 'node:path'
import {
  always as K,
  curry,
  find,
  equals,
  map,
  filter,
  pipe,
  propOr,
  reduce,
  concat,
  groupBy,
  head,
  chain,
  when,
} from 'ramda'
import { log } from './log'
import { isNotEmpty } from 'inherent'
import { parallel, resolve } from 'fluture'
import {
  readDirWithConfig,
  pathJoin as normalPathJoin,
  readFile,
} from 'file-system'
import { renderReadme } from './markdown'

const processWorkspace = curry((drGenPath, workspaces) => {
  return drGenPath
    ? pipe(
        readFile,
        map(JSON.parse),
        map(drGen => ({ drGen, workspaces }))
      )(drGenPath)
    : resolve({ drGen: [], workspaces })
})

const processPackage = curry(
  (drGen, workspaces) =>
    console.log(workspaces, '<<<') ||
    pipe(
      log.summary('uhhh'),
      map(
        pathName =>
          console.log('PATH NAME', pathName) ||
          pipe(
            log.summary('pathName'),
            z => pathJoin(z, 'package.json'),
            readFile,
            map(JSON.parse),
            map(raw => ({
              ...raw,
              group: pathName.slice(0, pathName.indexOf('/')),
              documentation: filter(
                doc => doc.filename.startsWith(pathName),
                drGen ?? []
              ),
            })),
            log.summary('mapped')
          )(pathName)
      ),
      parallel(10),
      map(
        pipe(
          map(pipe(({ group, ...z }) => [group, z])),
          groupBy(head),
          map(map(([_k, g]) => [g]))
        )
      )
    )(workspaces)
)

export const summarize = config => {
  const {
    repoUrl,
    pkgPath,
    drGenPath,
    deps,
    readme,
    pagesUrl,
    help = false,
    cwd,
    HELP,
  } = config
  const dirPath = dirname(pkgPath)
  return help
    ? HELP
    : pipe(
        readFile,
        map(pipe(JSON.parse, propOr([], 'workspaces'))),
        map(map(normalPathJoin(dirPath))),
        map(log.summary('Oh yeah')),
        map(
          map(
            readDirWithConfig({
              onlyDirectories: true,
            })
          )
        ),
        chain(parallel(10)),
        map(reduce(concat, [])),
        chain(processWorkspace(drGenPath)),
        map(log.summary('processed?')),
        chain(processPackage(drGenPath)),
        map(log.summary('processed package?'))
        // map(when(K(readme), renderReadme(repoUrl, deps, pagesUrl)))
      )(pkgPath)
}
