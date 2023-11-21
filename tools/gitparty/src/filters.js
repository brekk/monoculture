import {
  test,
  toLower,
  equals,
  toPairs,
  reduce,
  indexOf,
  __ as $,
  path,
  split,
  includes,
  map,
  pipe,
  curry,
  any,
  propOr,
  startsWith,
} from 'ramda'

export const indexAny = curry((lookup, x) => indexOf(lookup, x) > -1)

export const matchesWildcards = curry((wildcards, list) =>
  any(map(includes, wildcards))(list)
)

export const anyFilesMatchFromObject = curry((wildcards, changes) =>
  pipe(
    toPairs,
    reduce((agg, [, v]) => agg || matchesWildcards(wildcards, v), false)
  )(changes)
)

export const isMergeCommit = pipe(propOr('', 'subject'), startsWith('Merge'))

export const stringMatcherWithCanon = curry((canon, commit, [k, v]) => {
  // TODO: What is this coercion for?
  if (v === 'true' || v === 'false') {
    v = !!v
  }
  const dotted = indexAny('.', k)
  if (dotted || commit?.[k]) {
    const compares = equals(v)
    const value = dotted ? pipe(split('.'), path($, commit)) : commit[k]
    // authors are magical
    if (k === 'author' || k === 'authorName') {
      return getCanon(value) === getCanon(v)
    }
    if ((Array.isArray(value) && indexAny('*'), v)) {
      return any(compares, value)
    }
    if (test(/~$/, v)) {
      return pipe(toLower, indexAny(v.replace(/~$/, '')))(value)
    }
    return compares(value)
  }
})
