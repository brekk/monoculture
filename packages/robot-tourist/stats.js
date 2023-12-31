import { curry } from 'ramda'
import { correlate, parseWords } from './string'

// produce words in a histogram (and throw away anything which only occurs once)
export const histograph = curry(function _histograph(
  config,
  { entities, ...x }
) {
  return {
    ...x,
    entities,
    words: parseWords({ ...config, entities }),
  }
})

export const correlateSimilar = curry(function _correlateSimilar(
  $similarWords,
  { words, lines, ...x }
) {
  const report = correlate($similarWords, words, lines)
  return { ...x, lines, words, report }
})
