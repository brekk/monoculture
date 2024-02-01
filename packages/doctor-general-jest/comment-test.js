import { extname, basename, dirname, join as pathJoin } from 'node:path'
import { isNotEmpty } from 'inherent'
import {
  head,
  endsWith,
  startsWith,
  tap,
  includes,
  curry,
  defaultTo,
  filter,
  map,
  pathOr,
  pipe,
  prop,
  propOr,
  reduce,
  replace,
  any,
} from 'ramda'
import { log } from './log'
export const TESTABLE_EXAMPLE = 'test=true'
export const matchesTestable = pipe(head, endsWith(TESTABLE_EXAMPLE))

/**
 * Merge two file representations. Can be right or left associative
 * @name combineFiles
 * @exported
 * @param {boolean} leftToRight Associate left to right
 * @param {File} a left file
 * @param {File} b right file
 * @returns {File} Merged file
 * @signature boolean -> File -> File -> File
 * @example
 * ```js
 * const a = { a: true, greeting: 'hello', comments: ['one', 'two'], links: ['a', 'b'] }
 * const b = { b: true, greeting: 'ahoy', comments: ['three', 'four'], links: ['c', 'd'] }
 * expect(combineFiles(true, a, b)).toEqual({
 *   a: true,
 *   b: true,
 *   greeting: 'ahoy',
 *   comments: ['one', 'two', 'three', 'four'],
 *   links: ['a', 'b', 'c', 'd']
 * })
 * expect(combineFiles(false, a, b)).toEqual({
 *   a: true,
 *   b: true,
 *   greeting: 'hello',
 *   comments: ['three', 'four', 'one', 'two'],
 *   links: ['c', 'd', 'a', 'b']
 * })
 * ```
 */
export const combineFiles = curry(function _combineFiles(leftToRight, a, b) {
  return !leftToRight
    ? combineFiles(true, b, a)
    : {
        ...a,
        ...b,
        comments: [...a.comments, ...b.comments],
        links: [...a.links, ...b.links],
      }
})
export const stripRelative = replace(/\.\.\/|\.\//g, '')

export const hasExample = pipe(
  pathOr('', ['structure', 'example']),
  matchesTestable
)

export const testUsesImport = curry((imp, ex) => any(includes(imp), ex))

export const filterAndStructureTests = pipe(
  filter(pipe(propOr([], 'comments'), filter(hasExample), isNotEmpty)),
  map(raw => {
    const filename = stripRelative(raw.filename)
    const ext = extname(filename)
    // log.filter('raw', raw)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      testPath: `${basename(filename, ext)}.spec${ext}`,
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    console.log('FILENAMES', filenames)
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
