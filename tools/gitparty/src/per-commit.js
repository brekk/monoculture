import {
  values,
  join,
  curry,
  pipe,
  reduce,
  map,
  ifElse,
  always as K,
} from 'ramda'
import mm from 'micromatch'

// TODO: make a thingie that cycles on colors in case someone didn't provide them ?

export const checkPatternAgainstCommit = curry((commit, pattern) =>
  mm.some(commit.files, pattern.matches)
)

export const applyPatternsWithChalk = curry((chalk, patterns, commit) =>
  pipe(
    values,
    map(
      ifElse(
        checkPatternAgainstCommit(commit),
        pattern => pattern.fn(` ${pattern.key} `),
        K('─┴─')
      )
    ),
    join('')
  )(patterns)
)
