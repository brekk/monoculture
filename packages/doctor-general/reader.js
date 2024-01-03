import { log } from './log'
import { chain, curry, flatten, map, pipe, propOr } from 'ramda'
import { parallel } from 'fluture'
import { signal } from 'kiddo'
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

export const readPackageJsonWorkspaces = curry(
  function _readPackageJsonWorkspaces(root, x) {
    return map(
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
  }
)

export const monorepoRunner = curry(
  function _monorepoRunner(searchGlob, ignore, root, x) {
    const cancel = () => {}
    return pipe(
      log.core('reading root package.json'),
      readJSONFile,
      readPackageJsonWorkspaces(root),
      chain(parallel(10)),
      signal(cancel, {
        text: 'Reading all workspaces...',
        successText: 'Read all workspaces!',
        failText: 'Unable to read all workspaces.',
      }),
      map(flatten),
      iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
      chain(parallel(10)),
      map(log.verbose('files read')),
      map(flatten),
      signal(cancel, {
        text: 'Reading all files...',
        successText: 'Read all files!',
        failText: 'Unable to read all files.',
      })
    )(x)
  }
)
