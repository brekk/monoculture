import { values, join, curry, pipe, map, ifElse, always as K } from 'ramda'
import mm from 'micromatch'

// TODO: make a thingie that cycles on colors in case someone didn't provide them ?

export const checkPatternAgainstCommit = curry((commit, pattern) =>
  mm.some(commit.files, pattern.matches)
)
export const DASH_DOT = '─⏺─'

export const applyPatterns = curry((patterns, commit) =>
  pipe(map(checkPatternAgainstCommit(commit)))(patterns)
)
export const subrender = curry((yes, or, pattern) =>
  yes ? pattern.fn(` ${pattern.key} `) : or
)

export const renderPattern = curry((or, commit, pattern) =>
  ifElse(
    checkPatternAgainstCommit(commit),
    p => subrender(true, DASH_DOT, p),
    K(or)
  )(pattern)
)

export const renderPatternsWithAlt = curry((alt, patterns, commit) =>
  pipe(values, map(renderPattern(alt, commit)), join(''))(patterns)
)
export const renderPatterns = renderPatternsWithAlt(DASH_DOT)
