import { curry, join, pipe, range, reduce, split } from 'ramda'
import { NEWLINE, SPACE, EMPTY, TAB } from './constants'

const makeSplitJoinPair = z => [split(z), join(z)]

export const [words, unwords] = makeSplitJoinPair(SPACE)
export const [lines, unlines] = makeSplitJoinPair(NEWLINE)
export const [chars, unchars] = makeSplitJoinPair(EMPTY)
export const [tabs, untabs] = makeSplitJoinPair(TAB)
export const prepend = curry((pre, x) => `${pre}${x}`)
export const append = curry((post, x) => `${x}${post}`)

export const cake = curry(
  (bottom, top, layer, x) => pipe(join(layer), prepend(top), append(bottom))(x)
  // `${top}${join(layer, x)}${bottom}`
)
const MARKDOWN_LIST_ITEM = ' - '
export const markdownTabs = cake(
  NEWLINE,
  `\n${MARKDOWN_LIST_ITEM}`,
  MARKDOWN_LIST_ITEM
)

export const nthIndexOf = curry((delim, n, input) =>
  pipe(
    range(0),
    reduce((x, _) => input.indexOf(delim, x + 1), -1),
    z => input.slice(0, z)
  )(n)
)

export const nthLastIndexOf = curry((delim, n, input) =>
  pipe(
    range(0),
    reduce((x, _) => input.lastIndexOf(delim, x - 1), input.length),
    z => input.slice(z + 1)
  )(Math.abs(n))
)

export const nthIndex = curry((delim, n, input) =>
  (n > 0 ? nthIndexOf : nthLastIndexOf)(delim, n, input)
)