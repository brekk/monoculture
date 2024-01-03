import {
  trim,
  anyPass,
  startsWith,
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

// isJSDocComment :: String -> Boolean
export const isJSDocComment = pipe(
  trim,
  anyPass([startsWith('/**'), startsWith('*'), startsWith('*/')])
)
