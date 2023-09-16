import { cwd } from 'node:process'
import { basename, join as pathJoin, dirname } from 'node:path'
import {
  fromPairs,
  last,
  applySpec,
  ap,
  prop,
  reduce,
  includes,
  __,
  always as K,
  chain,
  curry,
  defaultTo,
  filter,
  flatten,
  groupBy,
  head,
  identity as I,
  join,
  length,
  lt,
  map,
  path,
  pathOr,
  pipe,
  propOr,
  replace,
  slice,
  sortBy,
  tap,
  toLower,
  toPairs,
  toUpper,
} from 'ramda'
import { and as futureAnd, fork, parallel } from 'fluture'
import {
  pathRelativeTo,
  readJSONFile,
  mkdirp,
  readDirWithConfig,
  writeFile,
  writeFileWithAutoPath,
} from 'fl-utils'
import { rarestBy } from './stats'

import { parseFile } from './parse'
import { stripRelative, j2 } from './text'
import { scopedBinaryEffect, trace } from './trace'
import { commentToMarkdown } from './renderer'
import { YARGS_CONFIG, parser, CONFIG_DEFAULTS } from './config'
import { slug, stripLeadingHyphen } from './comment'

const parsePackageName = y => {
  const slash = y.indexOf('/')
  const start = slash + 1
  const end = y.indexOf('/', start)
  return y.slice(start, end)
}

const capitalToKebab = s =>
  pipe(
    replace(/\//g, '-'),
    replace(/--/g, '-')
  )(s.replace(/[A-Z]/g, match => `-` + match))

const readPackageJsonWorkspaces = curry((root, x) =>
  map(
    pipe(
      // grab the workspaces field
      propOr([], 'workspaces'),
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
  const result = capitalToKebab(sliced) + '.mdx'
  return (
    (fileGroup ? fileGroup + '/' : '') +
    stripLeadingHyphen(sliced !== title ? capitalize(result) : result)
  )
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
      pipe(cleanFilename, x => basename(x, '.mdx'))(raw),
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
        })
      )(raw),
    ]),
    groupBy(pipe(last, propOr('', 'group'))),
    map(
      pipe(
        sortBy(pathOr(0, ['order'])),
        map(([title, { name }]) => [
          pipe(capitalToKebab, stripLeadingHyphen)(title),
          name,
        ]),
        fromPairs
      )
    ),
    toPairs,
    map(([folder, data]) =>
      writeFileWithAutoPath(
        pathJoin(outputDir, workspace, folder, '_meta.json'),
        JSON.stringify(data, null, 2)
      )
    )
  )(commentedFiles)
)

const runner = ({
  input,
  output,
  search: searchGlob = CONFIG_DEFAULTS.search,
  ignore = CONFIG_DEFAULTS.ignore,
  artifact = false,
}) => {
  const current = cwd()
  const rel = pathRelativeTo(current)
  const [pkgJson, outputDir, relativeArtifact] = map(rel, [
    input,
    output,
    artifact,
  ])
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = input.slice(0, input.lastIndexOf('/'))
  const relativize = r => toLocal + '/' + r
  return pipe(
    // read the package.json file
    readJSONFile,
    // reach into the Future
    readPackageJsonWorkspaces(root),
    // take the Future of an array of Futures, make it a single Future
    chain(parallel(10)),
    // take [[apps/workspace, apps/workspace2], [scripts/workspace]]
    // and make them [apps/workspace, apps/workspace2, scripts/workspace]
    map(flatten),
    // let's add globs
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    // Future<error, Future<error, string>[]>
    chain(parallel(10)),
    // Future<error, string[]>
    // take [[files, in], [workspaces]] and make them [files, in, workspaces]
    map(flatten),
    map(map(relativize)),
    // check each file for comments
    // Future<error, Future<error, CommentBlock>[]>
    map(chain(parseFile(root))),
    // Future<error, CommentBlock[]>
    chain(parallel(10)),
    // Future<error, CommentBlock[]>
    // exclude any files which don't have any comments
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
    // map(scopedBinaryEffect(console.log, j2, 'pre write')),
    // if you gave an artifact
    artifact
      ? // write to a file
        chain(content =>
          pipe(
            // (as JSON)
            j2,
            writeFile(relativeArtifact),
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
          const filesToWrite = map(file =>
            writeFileWithAutoPath(
              pathJoin(
                outputDir,
                workspace,
                // this part is the structure of the file we wanna write
                cleanFilename(file)
              ),
              pipe(map(commentToMarkdown), join('\n'))(file.comments)
            )
          )(commentedFiles)
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
    map(K(`Wrote to ${outputDir}/daffy-doc-generated.json`))
  )(pkgJson)
}

const daffydoc = pipe(slice(2, Infinity), parser(YARGS_CONFIG), runner)

// fork it so it actually executes!
// eslint-disable-next-line no-console
fork(console.error)(console.log)(daffydoc(process.argv))