import { curry, range, pipe, reduce, replace } from 'ramda'

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

export const fence = curry((delim, n, input) =>
  (n > 0 ? nthIndexOf : nthLastIndexOf)(delim, n, input)
)

export const capitalize = raw => `${raw[0].toUpper()}${raw.slice(1)}`

export const capitalToKebab = s =>
  pipe(
    replace(/\//g, '-'),
    replace(/--/g, '-')
    // lowercaseFirst
  )(s.replace(/[A-Z]/g, match => `-` + match))

export const stripLeadingHyphen = replace(/^-/g, '')
