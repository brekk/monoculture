import { values, join, curry, pipe, map, ifElse, always as K } from 'ramda'
import mm from 'micromatch'

// TODO: make a thingie that cycles on colors in case someone didn't provide them ?

export const checkPatternAgainstCommit = curry(
  function _checkPatternAgainstCommit(commit, pattern) {
    return mm.some(commit.files, pattern.matches)
  }
)
export const DASH_DOT = '─⏺─'

export const applyPatterns = curry(function _applyPatterns(patterns, commit) {
  return pipe(map(checkPatternAgainstCommit(commit)))(patterns)
})
export const subrender = curry(function _subrender(yes, or, pattern) {
  return yes ? pattern.fn(` ${pattern.key} `) : or
})

export const renderPattern = curry(
  function _renderPattern(or, commit, pattern) {
    return ifElse(
      checkPatternAgainstCommit(commit),
      p => subrender(true, DASH_DOT, p),
      K(or)
    )(pattern)
  }
)

export const renderPatternsWithAlt = curry(
  function _renderPatternsWithAlt(alt, patterns, commit) {
    return pipe(values, map(renderPattern(alt, commit)), join(''))(patterns)
  }
)
export const renderPatterns = renderPatternsWithAlt(DASH_DOT)
