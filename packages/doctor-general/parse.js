import { basename, extname } from 'node:path'

import {
  applySpec,
  identity as I,
  mergeRight,
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
  when,
  is,
} from 'ramda'
import { readFile } from 'file-system'
import { nthIndex, lines } from 'knot'
import { wrap } from 'inherent'

import { isJSDocComment, addLineNumbers, groupContiguousBlocks } from './file'
import { stripRelative } from './text'
import { objectifyComments } from './comment'

const fromStructureOr = curry(function _fromStructureOr(def, crumbs, x) {
  return pathOr(def, ['structure', ...when(is(String), wrap)(crumbs)], x)
})

const getAny = curry(function _getAny(def, keyPath, comments) {
  return pipe(
    map(pathOr(def, keyPath)),
    filter(identity),
    uniq,
    x => x.sort(),
    head
  )(comments)
})

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

export const MAGIC_COMMENT_START = '/**'
export const MAGIC_COMMENT_END = '*/'

/**
 * @name parse
 * @example
 * ```js test=true
 * import { MAGIC_COMMENT_END, MAGIC_COMMENT_START } from '../parse'
 * // drgen-import-above
 * const RAW = `
 * This is my really cool function
 * @name exampleFunction
 * `
 * const pseudocomment = z => [
 *   MAGIC_COMMENT_START,
 *   z.split('\n').map(y => '* ' + y).join('\n'),
 *   MAGIC_COMMENT_END
 * ].join('')
 * const FILENAME = 'monoculture/packages/cool/myfile.js'
 * const parsed = parse(FILENAME, pseudocomment(RAW))
 * expect(parsed).toEqual({
 *   comments: [
 *     {
 *       addTo: "",
 *       end: 3,
 *       fileGroup: "",
 *       keywords: ["@name"],
 *       lines: RAW.split('\n').filter(z => z.trim()),
 *       links: [],
 *       start: 0,
 *       structure: {},
 *       summary: RAW
 *     }
 *   ],
 *   fileGroup: undefined,
 *   filename: FILENAME,
 *   links: [],
 *   order: 0,
 *   package: 'cool',
 *   pageSummary: '',
 *   pageTitle: undefined,
 *   slugName: 'myfile'
 * })
 * ```
 */
export const parse = curry(function _parse(rawFilename, content) {
  const filename = stripRelative(rawFilename)
  const slugName = basename(filename, extname(filename))
  return pipe(
    // String
    lines,
    // List String
    function processLines(raw) {
      return pipe(
        addLineNumbers,
        // List #[Integer, String]
        filter(pipe(last, isJSDocComment)),
        // List #[Integer, String]
        groupContiguousBlocks,
        // List #[Integer, String]
        objectifyComments(filename, raw),
        // List CommentBlock
        applySpec({
          pageTitle: getPageTitle,
          pageSummary: getPageSummary,
          comments: I,
          order: pipe(getAny('0', ['structure', 'order']), x =>
            parseInt(x, 10)
          ),
          fileGroup: getAny('', ['fileGroup']),
          links: pipe(map(propOr([], 'links')), flatten),
        }),
        mergeRight({
          package: getPackage(filename),
          slugName,
          filename,
        })
      )(raw)
    }
    // CommentedFile
  )(content)
})

export const parseFile = curry(function _parseFile(debugMode, filename) {
  return pipe(
    // String
    readFile,
    // Future<Error, String>
    map(parse(filename)),
    // remove orphan comments (parser found it but it's not well-formed)
    map(function exciseOrphanComments(p) {
      return {
        ...p,
        comments: pipe(
          filter(function skipEmptyComments({ lines: l, start, end, summary }) {
            return start !== end && !!summary && l.length > 0
          }),
          unless(
            K(debugMode),
            map(({ lines: __lines, ...rest }) => rest)
          )
        )(p.comments),
      }
    })
    // CommentedFile
  )(filename)
})
