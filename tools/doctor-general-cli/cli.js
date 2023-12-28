import { cwd } from 'node:process'
import PKG from './package.json'
import { log } from './log'
import { configurate } from 'climate'
import { isNotEmpty, j2, autobox } from 'inherent'
import { extname, basename, join as pathJoin, dirname } from 'node:path'
import {
  tap,
  ap,
  includes,
  when,
  always as K,
  applySpec,
  chain,
  curry,
  defaultTo,
  filter,
  flatten,
  fromPairs,
  groupBy,
  head,
  identity as I,
  ifElse,
  join,
  last,
  length,
  lt,
  map,
  path,
  pathOr,
  pipe,
  prop,
  propOr,
  reduce,
  replace,
  slice,
  sortBy,
  toLower,
  toPairs,
  toUpper,
} from 'ramda'
import { resolve, parallel } from 'fluture'
import {
  pathJoin as pathJoinRelative,
  readJSONFile,
  readDirWithConfig,
  writeFileWithAutoPath,
} from 'file-system'

import {
  slug,
  stripLeadingHyphen,
  commentToMarkdown,
  commentToJestTest,
  parseFile,
  stripRelative,
} from 'doctor-general'
import { HELP_CONFIG, YARGS_CONFIG, CONFIG_DEFAULTS } from './config'

const parsePackageName = y => {
  const slash = y.indexOf('/')
  const start = slash + 1
  const end = y.indexOf('/', start)
  return y.slice(start, end)
}
// const lowercaseFirst = z => z[0].toLowerCase() + z.slice(1)

const capitalToKebab = s =>
  pipe(
    replace(/\//g, '-'),
    replace(/--/g, '-')
    // lowercaseFirst
  )(s.replace(/[A-Z]/g, match => `-` + match))

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

const pullPageTitleFromAnyComment = pipe(
  filter(pathOr(false, ['structure', 'page'])),
  map(path(['structure', 'page'])),
  head,
  defaultTo(''),
  replace(/\s/g, '-'),
  defaultTo(false)
)

const capitalize = raw => `${toUpper(raw[0])}${slice(1, Infinity)(raw)}`

const cleanFilename = curry(
  (testMode, { workspace, fileGroup, filename, comments }) => {
    const title = pullPageTitleFromAnyComment(comments)
    const sliced = title || slug(filename)
    const result = toLower(capitalToKebab(sliced)) + '.mdx'
    return testMode
      ? ''
      : stripLeadingHyphen((fileGroup ? fileGroup + '/' : '') + result)
  }
)

const combineFiles = curry((leftToRight, a, b) =>
  !leftToRight
    ? combineFiles(true, b, a)
    : {
        ...a,
        ...b,
        comments: [...a.comments, ...b.comments],
        links: [...a.links, ...b.links],
      }
)

const prepareMetaFiles = curry(
  (testMode, outputDir, workspace, commentedFiles) =>
    pipe(
      map(raw => [
        pipe(cleanFilename(testMode), x => basename(x, '.mdx'), toLower)(raw),
        pipe(
          propOr([], 'comments'),
          filter(pathOr(false, ['structure', 'name'])),
          head,
          applySpec({
            order: pipe(pathOr('0', ['structure', 'order']), x =>
              parseInt(x, 10)
            ),
            group: pathOr('', ['structure', 'group']),
            name: pipe(pathOr('???', ['structure', 'name'])),
            metaName: K(prop('slugName', raw)),
          })
        )(raw),
      ]),
      groupBy(pipe(last, propOr('', 'group'))),
      map(
        pipe(
          sortBy(pathOr(0, ['order'])),
          map(([title, { metaName }]) => [
            pipe(capitalToKebab, stripLeadingHyphen, toLower)(title),
            metaName,
          ]),
          fromPairs
        )
      ),
      toPairs,
      map(([folder, data]) =>
        writeFileWithAutoPath(
          pathJoin(outputDir, workspace, toLower(folder), '_meta.json'),
          JSON.stringify(data, null, 2)
        )
      )
    )(commentedFiles)
)

const processHelpOrRun = config => {
  return config.help || !config.input || !config.output
    ? resolve(config.HELP)
    : runner(config)
}

const TESTABLE_EXAMPLE = 'test=true'
const hasTestableExample = pipe(
  pathOr('', ['structure', 'example']),
  includes(TESTABLE_EXAMPLE)
)

const renderComments = curry((testMode, outputDir, x) =>
  chain(
    pipe(
      groupBy(propOr('unknown', testMode ? 'testPath' : 'workspace')),
      tap(xxx =>
        log.cli(
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

const filterAndStructureTests = pipe(
  filter(pipe(propOr([], 'comments'), filter(hasTestableExample), isNotEmpty)),
  map(raw => {
    const filename = stripRelative(raw.filename)
    const ext = extname(filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      testPath: `${basename(filename, ext)}.spec${ext}`,
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    const alreadyInList = filenames.includes(file.filename)
    const anyFile = file.comments.filter(({ structure }) => structure.asFile)
    const someFile = anyFile.length > 0 ? anyFile[0] : false
    const asFilePath = pipe(
      defaultTo({}),
      pathOr('???', ['structure', 'asFile'])
    )(someFile)
    const withOrder = pipe(pathOr('0', ['structure', 'order']), x =>
      parseInt(x, 10)
    )(someFile)
    const dir = dirname(file.filename)
    const newFile = someFile ? pathJoin(dir, asFilePath) : '???'
    return alreadyInList
      ? map(raw => {
          const check = raw.filename === file.filename
          return check ? combineFiles(raw.order < withOrder, raw, file) : raw
        })(agg)
      : [
          ...agg,
          someFile
            ? {
                ...file,
                filename: newFile,
                order: withOrder,
                originalFilename: file.filename,
              }
            : file,
        ]
  }, [])
)

const filterAndStructureComments = pipe(
  filter(pipe(propOr([], 'comments'), length, lt(0))),
  map(raw => {
    const filename = stripRelative(raw.filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      workspace: parsePackageName(filename),
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    const alreadyInList = filenames.includes(file.filename)
    const anyFile = file.comments.filter(({ structure }) => structure.asFile)
    const someFile = anyFile.length > 0 ? anyFile[0] : false
    const asFilePath = pipe(
      defaultTo({}),
      pathOr('???', ['structure', 'asFile'])
    )(someFile)
    const withOrder = pipe(pathOr('0', ['structure', 'order']), x =>
      parseInt(x, 10)
    )(someFile)
    const dir = dirname(file.filename)
    const newFile = someFile ? pathJoin(dir, asFilePath) : '???'
    return alreadyInList
      ? map(raw => {
          const check = raw.filename === file.filename
          return check ? combineFiles(raw.order < withOrder, raw, file) : raw
        })(agg)
      : [
          ...agg,
          someFile
            ? {
                ...file,
                filename: newFile,
                order: withOrder,
                originalFilename: file.filename,
              }
            : file,
        ]
  }, [])
)

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

const monorunner = curry((searchGlob, ignore, root, x) => {
  return pipe(
    log.cli('reading root package.json'),
    readJSONFile,
    readPackageJsonWorkspaces(root),
    chain(parallel(10)),
    map(log.cli('reading all the workspaces')),
    map(flatten),
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    chain(parallel(10)),
    map(log.cli('monorun output')),
    map(flatten)
  )(x)
})

const runner = config => {
  const {
    debug,
    input,
    output,
    search: searchGlob = CONFIG_DEFAULTS.search,
    ignore = CONFIG_DEFAULTS.ignore,
    artifact = false,
    testMode,
    monorepo: monorepoMode = false,
  } = config
  log.cli('input', input)
  log.cli('monorepoMode', monorepoMode)
  log.cli('testMode', testMode)
  const current = cwd()
  const rel = pathJoinRelative(current)
  const outputDir = rel(output)
  const relativeArtifact = artifact ? rel(artifact) : false
  const relativeInput = map(rel, input)
  const pkgJson = monorepoMode ? relativeInput[0] : 'NOT RELEVANT'
  log.cli('relating...', `${current} -> ${output}`)
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = map(ii => ii.slice(0, ii.lastIndexOf('/')), input)
  const relativize = r => (monorepoMode ? pathJoin(toLocal[0], r) : r)
  return pipe(
    log.cli(`monorepoMode?`),
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

const { name: $NAME, description: $DESC } = PKG
export const drgen = curry((cancel, argv) =>
  pipe(
    slice(2, Infinity),
    configurate(
      YARGS_CONFIG,
      CONFIG_DEFAULTS,
      HELP_CONFIG,

      { name: $NAME, description: $DESC }
    ),
    chain(processHelpOrRun)
  )(argv)
)
