import { curry } from 'ramda'
import { correlate, parseWords } from './string'
const j2 = x => JSON.stringify(x, null, 2)

// produce words in a histogram (and throw away anything which only occurs once)
export const histograph = curry((config, { entities, ...x }) => ({
  ...x,
  entities,
  words: parseWords({ ...config, entities }),
}))

export const correlateSimilar = curry(
  ($similarWords, { words, lines, ...x }) => {
    const report = correlate($similarWords, words, lines)
    return { ...x, lines, words, report }
  }
)
