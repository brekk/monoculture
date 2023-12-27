import { dirname, join as pathJoin } from 'node:path'
import { j2 } from 'inherent'
import {
  startsWith,
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

const getWorkspaceGroupFromPath = pathName => {
  let y = pathName
  const isLocal = startsWith('./')
  const isParent = startsWith('..')
  while (isLocal(y)) {
    y = y.slice(2)
  }
  while (isParent(y)) {
    y = y.slice(3)
  }
  return y.slice(0, y.indexOf('/'))
}

const processPackage = curry((drGenPath, { drGen, workspaces }) =>
  pipe(
    map(pathName =>
      pipe(
        z => pathJoin(z, 'package.json'),
        readFile,
        map(JSON.parse),
        map(raw => ({
          ...raw,
          group: getWorkspaceGroupFromPath(pathName),
          documentation: filter(
            doc => doc.filename.startsWith(pathName),
            drGen ?? []
          ),
        }))
      )(pathName)
    ),
    parallel(10),
    map(
      pipe(
        map(pipe(({ group, ...z }) => [group, z])),
        groupBy(head),
        map(map(([_k, g]) => g))
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
        chain(processPackage(drGenPath)),
        map(when(K(readme), renderReadme(repoUrl, deps, pagesUrl)))
      )(pkgPath)
}
