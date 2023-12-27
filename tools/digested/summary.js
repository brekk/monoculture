import { join as pathJoin } from 'node:path'
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
import { isNotEmpty } from 'inherent'
import { parallel, resolve } from 'fluture'
import { readDirWithConfig, readFile } from 'file-system'
import { renderReadme } from './markdown'

const processWorkspace = curry((drGenPath, workspaces) => {
  return isNotEmpty(drGenPath)
    ? pipe(
        readFile,
        map(JSON.parse),
        map(drGen => ({ drGen, workspaces }))
      )(drGenPath)
    : resolve({ drGen: [], workspaces })
})

const processPackage = curry((drGen, workspaces) =>
  pipe(
    map(pathName =>
      pipe(
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
        }))
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

export const summarize = ({
  repoUrl,
  pkg,
  drGenPath,
  deps,
  readme,
  pagesUrl,
  help = false,
  HELP,
}) => {
  return help
    ? HELP
    : pipe(
        propOr([], 'workspaces'),
        map(readDirWithConfig({ onlyDirectories: true })),
        parallel(10),
        map(reduce(concat, [])),
        chain(processWorkspace(drGenPath)),
        chain(processPackage(drGenPath)),
        when(K(readme), renderReadme(repoUrl, deps, pagesUrl))
      )(pkg)
}
