import { log } from './log'
import { chain, curry, flatten, map, pipe, propOr } from 'ramda'
import { parallel } from 'fluture'
import { readJSONFile, readDirWithConfig } from 'file-system'

export const iterateOverWorkspacesAndReadFiles = curry(
  (searchGlob, ignore, root, x) => {
    return map(
      pipe(
        // look for specific file types
        map(workspace => workspace + searchGlob),
        // exclude some search spaces
        chain(
          readDirWithConfig({
            ignore,
            cwd: root,
          })
        )
      )
    )(x)
  }
)

export const readPackageJsonWorkspaces = curry((root, x) =>
  map(
    pipe(
      // grab the workspaces field
      propOr([], 'workspaces'),
      log.parse('workspaces'),
      // we want directories only
      map(z => `${z}/`),
      // read all the directories
      map(readDirWithConfig({ cwd: root }))
    )
  )(x)
)

export const monorepoRunner = curry((searchGlob, ignore, root, x) => {
  return pipe(
    log.core('reading root package.json'),
    readJSONFile,
    readPackageJsonWorkspaces(root),
    chain(parallel(10)),
    map(log.core('reading all the workspaces')),
    map(flatten),
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    chain(parallel(10)),
    map(log.core('monorun output')),
    map(flatten)
  )(x)
})
