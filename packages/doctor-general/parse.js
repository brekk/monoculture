import { basename, extname } from 'node:path'

import {
  unless,
  always as K,
  defaultTo,
  join,
  curry,
  filter,
  flatten,
  head,
  identity,
  last,
  map,
  pathOr,
  pipe,
  propOr,
  uniq,
} from 'ramda'
import { readFile } from 'file-system'
import { isJSDocComment, addLineNumbers, groupContiguousBlocks } from './file'
import { stripRelative } from './text'
import { nthIndex, lines } from 'knot'
import { objectifyComments } from './comment'

const getAny = curry((def, keyPath, comments) =>
  pipe(
    map(pathOr(def, keyPath)),
    filter(identity),
    uniq,
    x => x.sort(),
    head
  )(comments)
)

const getPageSummary = pipe(
  getAny('', ['structure', 'pageSummary']),
  defaultTo([]),
  join(' ')
)

const getPageTitle = getAny('', ['structure', 'page'])

const getPackage = i => {
  if (i.indexOf('/') > -1) {
    const y = nthIndex('/', -2, i)
    return y.slice(0, y.indexOf('/'))
  }
  return i
}

export const parse = curry((root, filename, content) => {
  const newName = stripRelative(filename)
  const slugName = basename(newName, extname(newName))
  return pipe(
    // String
    lines,
    // List String
    raw =>
      pipe(
        addLineNumbers,
        // List #[Integer, String]
        filter(pipe(last, isJSDocComment)),
        // List #[Integer, String]
        groupContiguousBlocks,
        // List #[Integer, String]
        objectifyComments(newName, raw),
        // List CommentBlock
        comments => ({
          slugName,
          package: getPackage(newName),
          pageTitle: getPageTitle(comments),
          pageSummary: getPageSummary(comments),
          filename: newName,
          comments,
          order: pipe(getAny('0', ['structure', 'order']), x =>
            parseInt(x, 10)
          )(comments),
          fileGroup: getAny('', ['fileGroup'], comments),
          links: pipe(map(propOr([], 'links')), flatten)(comments),
        })
      )(raw)
    // CommentedFile
  )(content)
})

// comments in pipe show current shape per step
export const parseFile = curry((debugMode, root, filename) =>
  pipe(
    // String
    readFile,
    // Future<Error, String>
    map(parse(root, filename)),
    // remove orphan comments (parser found it but its not well-formed)
    map(p => ({
      ...p,
      comments: pipe(
        filter(
          ({ lines: l, start, end, summary }) =>
            start !== end && !!summary && l.length > 0
        ),
        unless(
          K(debugMode),
          map(({ lines: _lines, ...rest }) => rest)
        )
      )(p.comments),
    }))
    // CommentedFile
  )(filename)
)
