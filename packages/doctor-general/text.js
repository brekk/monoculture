import {
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

// trimComment :: String -> String
export const trimComment = pipe(
  trim,
  when(startsWith('* '), slice(2, Infinity))
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
    replace(/\//g, '-'),
    replace(/--/g, '-')
    // lowercaseFirst
  )(s.replace(/[A-Z]/g, match => `-` + match))

export const stripLeadingHyphen = replace(/^-/g, '')

export const slug = name => {
  const slashPlus = name.lastIndexOf('/') + 1
  return name.indexOf('.') > -1
    ? name.slice(slashPlus, name.indexOf('.'))
    : name.slice(slashPlus)
}
