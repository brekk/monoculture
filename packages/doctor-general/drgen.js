import { join as pathJoin } from 'node:path'
import { cwd } from 'node:process'
import { log } from './log'
import { j2, autobox } from 'inherent'
import { commentToMarkdown } from './renderer-markdown'
import { commentToJestTest } from './renderer-jest'
import { prepareMetaFiles } from './next-meta-files'
import {
  tap,
  ap,
  when,
  always as K,
  chain,
  curry,
  filter,
  flatten,
  groupBy,
  head,
  identity as I,
  ifElse,
  join,
  map,
  pathOr,
  pipe,
  propOr,
  toPairs,
} from 'ramda'
import { resolve, parallel } from 'fluture'
import {
  pathJoin as pathJoinRelative,
  readJSONFile,
  readDirWithConfig,
  writeFileWithAutoPath,
} from 'file-system'
import { parseFile } from './parse'
import {
  hasTestableExample,
  cleanFilename,
  filterAndStructureComments,
  filterAndStructureTests,
} from './comment'

const iterateOverWorkspacesAndReadFiles = curry(
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

const readPackageJsonWorkspaces = curry((root, x) =>
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

const monorunner = curry((searchGlob, ignore, root, x) => {
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

const writeArtifact = curry((artifactPath, xxx) =>
  chain(content =>
    pipe(
      j2,
      writeFileWithAutoPath(artifactPath),
      // but persist our original content for downstream consumption
      map(K(content))
    )(content)
  )(xxx)
)

export const drgen = config => {
  const {
    debug,
    input,
    output,
    search: searchGlob,
    ignore,
    artifact = false,
    testMode,
    monorepo: monorepoMode = false,
  } = config
  log.core('input', input)
  log.core('monorepoMode', monorepoMode)
  log.core('testMode', testMode)
  const current = cwd()
  const rel = pathJoinRelative(current)
  const outputDir = rel(output)
  const relativeArtifact = artifact ? rel(artifact) : false
  const relativeInput = map(rel, input)
  const pkgJson = monorepoMode ? relativeInput[0] : 'NOT RELEVANT'
  log.core('relating...', `${current} -> ${output}`)
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = map(ii => ii.slice(0, ii.lastIndexOf('/')), input)
  const relativize = r => (monorepoMode ? pathJoin(toLocal[0], r) : r)
  return pipe(
    log.core(`monorepoMode?`),
    ifElse(
      I,
      () => monorunner(searchGlob, ignore, root, pkgJson),
      () => resolve(input)
    ),
    map(pipe(map(relativize), chain(parseFile(debug, root)))),
    chain(parallel(10)),
    map(testMode ? filterAndStructureTests : filterAndStructureComments),
    when(K(artifact), writeArtifact(relativeArtifact)),
    renderComments(testMode, outputDir),
    map(
      K(
        artifact || output
          ? `Wrote to${output ? ' output: "' + output + '";' : ''}${
              artifact ? ' artifact: "' + artifact + '"' : ''
            }.`
          : `Processed ${input.join(' ')}`
      )
    )
  )(monorepoMode)
}

const renderComments = curry((testMode, outputDir, x) =>
  chain(
    pipe(
      groupBy(propOr('unknown', testMode ? 'testPath' : 'workspace')),
      tap(xxx =>
        log.core(
          `grouped ${testMode ? 'tests' : 'comments'}...`,
          pipe(
            toPairs,
            map(
              ([k, y]) =>
                `\n${k}:\n - ${pipe(
                  map(z => z.slugName),
                  join('\n - ')
                )(y)}`
            ),
            join('\n')
          )(xxx)
        )
      ),
      toPairs,
      map(([workspace, commentedFiles]) => {
        const filesToWrite = map(file => {
          const filePathToWrite = pathJoin(
            outputDir,
            workspace,
            // this part is the structure of the file we wanna write
            cleanFilename(testMode, file)
          )
          const importsForTests = !testMode
            ? []
            : pipe(
                map(
                  pipe(
                    autobox,
                    ap([
                      pathOr(false, ['structure', 'name']),
                      hasTestableExample,
                    ])
                  )
                ),
                filter(([a, b]) => a && b),
                map(head)
              )(file.comments)
          const renderedComments = pipe(
            map(testMode ? commentToJestTest : commentToMarkdown),
            z => {
              const out = !testMode
                ? ['# ' + file.slugName, file.pageSummary, ...z]
                : [
                    '// This test automatically generated by doctor-general.',
                    `// Sourced from '${file.filename}', edits to this file may be erased.`,
                    `import {
  ${importsForTests.join(',\n  ')}
} from '../${file.slugName}'\n`,
                    ...z,
                  ]
              return out
            },
            join(testMode ? '\n' : '\n\n')
          )(file.comments)
          return writeFileWithAutoPath(filePathToWrite, renderedComments)
        })(commentedFiles)
        return testMode
          ? filesToWrite
          : filesToWrite.concat(
              prepareMetaFiles(testMode, outputDir, workspace, commentedFiles)
            )
      }),
      flatten,
      parallel(10)
    )
  )(x)
)
