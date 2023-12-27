import { dirname, join as pathJoin } from 'node:path'
import {
  mergeRight,
  startsWith,
  always as K,
  curry,
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
  objOf,
} from 'ramda'
import { log } from './log'
import { parallel, resolve } from 'fluture'
import {
  readDirWithConfig,
  pathJoin as normalPathJoin,
  readFile,
} from 'file-system'
import { renderReadme } from './markdown'

const processWorkspace = curry((banner, bannerPath, drGenPath, workspaces) => {
  const readables = []
  if (drGenPath) {
    log.summary('reading doctor-general path', drGenPath)
    readables.push(
      pipe(readFile, map(JSON.parse), map(objOf('drGen')))(drGenPath)
    )
  }
  if (!banner && bannerPath) {
    log.summary('reading banner path', bannerPath)
    readables.push(pipe(readFile, map(objOf('banner')))(bannerPath))
  }
  return readables.length
    ? pipe(
        parallel(10),
        map(reduce((agg, x) => mergeRight(agg, x), { workspaces, banner }))
      )(readables)
    : resolve({ banner: banner || '', drGen: [], workspaces })
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

const processPackage = ({ drGen, workspaces, banner }) =>
  pipe(
    map(pathName => {
      const group = getWorkspaceGroupFromPath(pathName)
      return pipe(
        z => pathJoin(z, 'package.json'),
        readFile,
        map(JSON.parse),
        map(raw => ({
          ...raw,
          group,
          documentation: filter(
            doc => doc.filename.startsWith(group),
            drGen ?? []
          ),
        }))
      )(pathName)
    }),
    parallel(10),
    map(
      pipe(
        map(pipe(({ group, ...z }) => [group, z])),
        groupBy(head),
        map(map(([_k, g]) => g))
      )
    ),
    map(grouped => ({ banner, grouped }))
  )(workspaces)

export const summarize = config => {
  const {
    repoUrl,
    pkgPath,
    drGenPath,
    deps,
    readme,
    docUrl,
    help = false,
    cwd,
    banner,
    bannerPath,
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
        chain(processWorkspace(banner, bannerPath, drGenPath)),
        chain(processPackage),
        map(when(K(readme), renderReadme(repoUrl, deps, docUrl)))
      )(pkgPath)
}
