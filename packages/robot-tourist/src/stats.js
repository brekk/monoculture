import { curry } from 'ramda'
import { correlate, parseWords } from './string'
const j2 = x => JSON.stringify(x, null, 2)

// produce words in a histogram (and throw away anything which only occurs once)
export const histograph = curry(
  (
    {
      wordlimit: $wordlimit,
      skip: $skipWords,
      minimum: $hMin,
      infer: $similarWords,
    },
    { entities, ...x }
  ) => ({
    ...x,
    entities,
    words: parseWords({
      limit: $wordlimit,
      skip: $skipWords,
      entities,
      minimum: $hMin,
      infer: $similarWords,
    }),
  })
)

export const correlateSimilar = curry(
  ($similarWords, { words: w, lines: l, ...x }) => {
    const report = correlate($similarWords, w, l)
    return { ...x, lines: l, words: w, report }
  }
)
