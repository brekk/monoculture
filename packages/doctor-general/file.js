import {
  filter,
  pathOr,
  path,
  head,
  defaultTo,
  toLower,
  trim,
  anyPass,
  startsWith,
  curry,
  addIndex,
  map,
  match,
  pipe,
  split,
  reduce,
  last,
  replace,
  init,
} from 'ramda'
import { slug, stripLeadingHyphen, capitalToKebab } from './text'

// addLineNumbers :: List String -> List Comment
export const addLineNumbers = addIndex(map)((a, i) => [i, a])

// findJSDocKeywords :: String -> List String
export const findJSDocKeywords = match(/@(\w*)/g)

// cleanupKeywords :: String -> List String
export const cleanupKeywords = pipe(
  replace(/(.*)@(\w*)\s(.*)$/g, '$2 $3'),
  split(' ')
)

// groupContiguousBlocks :: List Comment -> List Comment
export const groupContiguousBlocks = reduce((agg, raw) => {
  const [i = -1] = raw
  const prev = last(agg)
  if (prev) {
    const top = last(prev)
    const [j = -1] = top
    if (j + 1 === i) {
      return [...init(agg), prev.concat([raw])]
    }
  }
  return agg.concat([[raw]])
}, [])

/**
 * Merge two file representations. Can be right or left associative
 * @name combineFiles
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
export const combineFiles = curry((leftToRight, a, b) =>
  !leftToRight
    ? combineFiles(true, b, a)
    : {
        ...a,
        ...b,
        comments: [...a.comments, ...b.comments],
        links: [...a.links, ...b.links],
      }
)

// isJSDocComment :: String -> Boolean
export const isJSDocComment = pipe(
  trim,
  anyPass([startsWith('/**'), startsWith('*'), startsWith('*/')])
)

export const pullPageTitleFromAnyComment = pipe(
  filter(pathOr(false, ['structure', 'page'])),
  map(path(['structure', 'page'])),
  head,
  defaultTo(''),
  replace(/\s/g, '-'),
  defaultTo(false)
)

export const cleanFilename = curry(
  (testMode, { fileGroup, filename, comments }) => {
    const title = pullPageTitleFromAnyComment(comments)
    const sliced = title || slug(filename)
    const result = toLower(capitalToKebab(sliced)) + '.mdx'
    return testMode
      ? ''
      : stripLeadingHyphen((fileGroup ? fileGroup + '/' : '') + result)
  }
)
