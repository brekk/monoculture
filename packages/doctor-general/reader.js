import { log } from './log'
import { chain, when, curry, flatten, map, pipe, propOr } from 'ramda'
import { parallel } from 'fluture'
import { signal } from 'kiddo'
import { readJSONFile, readDirWithConfig } from 'file-system'

/**
 * @name iterateOverWorkspacesAndReadFiles
 * @future
 * @example
 * ```js test=true
 * import { fork, resolve as resolveF, parallel } from 'fluture'
 * // drgen-import-above
 * fork(done)(x => {
 *   expect(x).toEqual([
 *     "tools/digested",
 *     "tools/doctor-general-cli",
 *     "tools/gitparty",
 *     "tools/spacework",
 *     "tools/superorganism",
 *     "tools/treacle",
 *   ])
 *   done()
 * })(
 *   iterateOverWorkspacesAndReadFiles(
 *     {
 *       searchGlob: '*',
 *       ignore: []
 *     },
 *     '../..',
 *     resolveF(['tools/'])
 *   )
 * )
 */
export const iterateOverWorkspacesAndReadFiles = curry(
  function _iterateOverWorkspacesAndReadFiles({ searchGlob, ignore }, root, x) {
    return pipe(
      // look for specific file types
      map(workspace => workspace + searchGlob),
      log.core('ITERATING'),
      chain(
        readDirWithConfig({
          // exclude some search spaces
          ignore,
          cwd: root,
        })
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
  function _monorepoRunner(cancel, config, root, pkgJsonPath) {
    const { showMatchesOnly } = config
    log.core('CONFIG', config)
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
      map(log.core('workflows, flat')),
      map(iterateOverWorkspacesAndReadFiles(config, root)),
      chain(parallel(10)),
      when(
        () => !showMatchesOnly,
        pipe(
          log.core('READ READ'),
          map(log.verbose('files read')),
          map(flatten),
          log.core('heynongman'),
          signal(cancel, {
            text: 'Reading all files...',
            successText: 'Read all files!',
            failText: 'Unable to read all files.',
          })
        )
      )
    )(pkgJsonPath)
  }
)
