import {
  reject,
  equals,
  length,
  includes,
  join,
  map,
  pipe,
  replace,
  slice,
  split,
  startsWith,
  trim,
  when,
} from 'ramda'

import { trace } from './trace'

export const lines = split('\n')
export const unlines = join('\n')

// trimComment :: String -> String
export const trimComment = pipe(
  trim,
  when(startsWith('* '), slice(2, Infinity))
)

export const trimSummary = pipe(
  // trace('in'),
  reject(equals('/**')),
  // trace('rej'),
  map(trimComment),
  // trace('trim'),
  unlines
)

// nixKeyword :: String -> String
export const nixKeyword = when(includes('@'), replace(/@/g, ''))

// wipeComment :: String -> String
export const wipeComment = pipe(trimComment, nixKeyword)
const replaceAsterisks = replace(/^\*$/g, '')

// formatComment :: List Comment -> List Comment
export const formatComment = block =>
  pipe(
    map(([, v]) => v),
    map(trimComment),
    slice(1, length(block) - 1)
  )(block)

export const j2 = x => JSON.stringify(x, null, 2)
export const stripRelative = replace(/\.\.\//g, '')
