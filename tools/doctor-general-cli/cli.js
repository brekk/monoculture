import { cwd } from 'node:process'
import PKG from './package.json'
import { log } from './log'
import { configurate } from 'climate'
import { j2 } from 'inherent'
import { basename, join as pathJoin, dirname } from 'node:path'
import {
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

const iterateOverWorkspacesAndReadFiles = curry((searchGlob, ignore, root, x) =>
  map(
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

const cleanFilename = ({ workspace, fileGroup, filename, comments }) => {
  const title = pullPageTitleFromAnyComment(comments)
  // const sliced = title || slug(filename)
  const sliced = title || slug(filename)
  const result = toLower(capitalToKebab(sliced)) + '.mdx'
  return stripLeadingHyphen((fileGroup ? fileGroup + '/' : '') + result)
}

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

const prepareMetaFiles = curry((outputDir, workspace, commentedFiles) =>
  pipe(
    map(raw => [
      pipe(cleanFilename, x => basename(x, '.mdx'), toLower)(raw),
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

const monorunner = curry((ignore, root, searchGlob, x) =>
  pipe(
    log.cli('reading root package.json'),
    readJSONFile,
    readPackageJsonWorkspaces(root),
    chain(parallel(10)),
    map(log.cli('reading all the workspaces')),
    map(flatten),
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    chain(parallel(10))
  )(x)
)

const runner = ({
  debug,
  input,
  output,
  search: searchGlob = CONFIG_DEFAULTS.search,
  ignore = CONFIG_DEFAULTS.ignore,
  artifact = false,
  testMode,
  monorepoMode,
}) => {
  const current = cwd()
  const rel = pathJoinRelative(current)
  const [pkgJson, outputDir, relativeArtifact] = map(rel, [
    input,
    output,
    artifact,
  ])
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = input.slice(0, input.lastIndexOf('/'))
  const relativize = r => toLocal + '/' + r
  return pipe(
    // ifElse(K(monorepoMode), monorunner(ignore, root, searchGlob), I),
    monorunner(ignore, root, searchGlob),
    map(log.cli('reading all files in all the workspaces')),
    map(flatten),
    map(map(relativize)),
    map(chain(parseFile(debug, root))),
    chain(parallel(10)),
    map(filter(pipe(propOr([], 'comments'), length, lt(0)))),
    map(
      map(raw => {
        const filename = stripRelative(raw.filename)
        return {
          ...raw,
          comments: raw.comments.map(r => ({ ...r, filename })),
          filename,
          workspace: parsePackageName(filename),
        }
      })
    ),
    map(
      reduce((agg, file) => {
        const filenames = map(prop('filename'), agg)
        const alreadyInList = filenames.includes(file.filename)
        const anyFile = file.comments.filter(
          ({ structure }) => structure.asFile
        )
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
              return check
                ? combineFiles(raw.order < withOrder, raw, file)
                : raw
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
    ),
    // if you gave an artifact
    artifact
      ? // write to a file
        chain(content =>
          pipe(
            // (as JSON)
            j2,
            writeFileWithAutoPath(relativeArtifact),
            // but persist our original content for downstream consumption
            map(K(content))
          )(content)
        )
      : // otherwise do nothing (identity)
        I, // x => x
    // underlying structure here is { [filename]: CommentBlock[] }
    // so we need to apply it to sub-paths
    chain(
      pipe(
        groupBy(propOr('unknown', 'workspace')),
        toPairs,
        map(([workspace, commentedFiles]) => {
          const filesToWrite = map(file => {
            const filePathToWrite = pathJoin(
              outputDir,
              workspace,
              // this part is the structure of the file we wanna write
              cleanFilename(file)
            )
            const renderedComments = pipe(
              map(testMode ? commentToJestTest : commentToMarkdown),
              testMode
                ? z => ['# ' + file.slugName, file.pageSummary, ...z]
                : I,
              join('\n\n')
            )(file.comments)
            return writeFileWithAutoPath(filePathToWrite, renderedComments)
          })(commentedFiles)
          const metaFiles = prepareMetaFiles(
            outputDir,
            workspace,
            commentedFiles
          )
          return filesToWrite.concat(metaFiles)
        }),
        flatten,
        parallel(10)
      )
    ),
    // tell the user about it
    map(K(`Wrote to ${outputDir}/dr-generated.json`))
  )(pkgJson)
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
