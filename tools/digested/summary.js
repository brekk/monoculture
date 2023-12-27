import { join as pathJoin } from 'node:path'
import {
  keys,
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
  toPairs,
} from 'ramda'
import { parallel, resolve } from 'fluture'
import { readDirWithConfig, readFile } from 'file-system'

const processWorkspace = curry((docWorkspace, workspaces) => {
  const matched = find(equals(docWorkspace), workspaces)
  return matched
    ? pipe(
        readFile,
        map(JSON.parse),
        map(drGen => ({ drGen, workspaces }))
      )(matched + '/dr-generated.json')
    : resolve({ drGen: [], workspaces })
})

const processCoolshit = ({ workspaces, drGen = [] }) =>
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
          map(([_k, v, d, deps, devDeps, docs]) => [v, d, deps, devDeps, docs])
        )
      )
    )
  )(workspaces)

export const summarize = curry((repo, pkg, docWorkspace, argv) => {
  const pagesURL = pagesForGithub(repo)
  return pipe(
    propOr([], 'workspaces'),
    map(readDirWithConfig({ onlyDirectories: true })),
    parallel(10),
    map(reduce(concat, [])),
    chain(processWorkspace(docWorkspace)),
    chain(processCoolshit),
    when(() => isReadme, renderReadme(repo, showDeps, pagesURL))
  )(pkg)
})
