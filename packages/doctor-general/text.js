import {
  is,
  equals,
  includes,
  length,
  map,
  pipe,
  reject,
  replace,
  slice,
  startsWith,
  trim,
  when,
} from 'ramda'
import { unlines } from 'knot'

export const safeTrim = when(is(String), trim)

/**
 * For strings which look like extended jsdoc comment line (e.g. ` * whatever`),
 * eschew the comment decoration
 * @name trimComment
 * @signature String -> String
 * @example
 * ```js test=true
 * expect(trimComment('          * zipzop')).toEqual('zipzop')
 * expect(trimComment(' * squiggle         ')).toEqual('squiggle')
 * const input = ' ~~kljlkjlk2j32lkj3 ' + Math.round(Math.random() * 1000)
 * expect(trimComment(input)).toEqual(input)
 * expect(trimComment(29292)).toEqual(29292)
 * ```
 */
export const trimComment = when(
  pipe(safeTrim, startsWith('* ')),
  pipe(safeTrim, slice(2, Infinity))
)

export const trimSummary = pipe(
  reject(equals('/**')),
  map(trimComment),
  unlines
)

// nixKeyword :: String -> String
export const nixKeyword = when(includes('@'), replace(/@/g, ''))

// wipeComment :: String -> String
export const wipeComment = pipe(trimComment, nixKeyword)
// const replaceAsterisks = replace(/^\*$/g, '')

// formatComment :: List Comment -> List Comment
export const formatComment = block =>
  pipe(
    map(([, v]) => v),
    map(trimComment),
    slice(1, length(block) - 1)
  )(block)

export const stripRelative = replace(/\.\.\/|\.\//g, '')

export const capitalToKebab = s =>
  pipe(
    replace(/[A-Z]/g, match => `-` + match),
    replace(/\//g, '-'),
    replace(/--/g, '-'),
    z => (z[0] === '-' ? z.slice(1) : z)
    // lowercaseFirst
  )(s)

export const stripLeadingHyphen = replace(/^-/g, '')
