import {
  when,
  toPairs,
  __ as $,
  zip,
  values,
  concat,
  split,
  join,
  map,
  filter,
  identity as I,
  pipe,
  reject,
  fromPairs,
  complement,
} from 'ramda'
const unwords = join(' ')
const words = split(' ')
function regex(z, flags) {
  return new RegExp(z)
}
import { isArray } from 'inherent'

const plugin = {
  name: 'get-imported',
  dependencies: [],
  fn: (c, file, { selectAll, any, log }) => {
    const last = z => z[z.length - 1]
    const rawImports = selectAll(/^import/, /from (.*)$/g)
    log('rawImports', rawImports)
    return pipe(
      map(reject(z => typeof z === 'number')),
      map(unwords),
      map(y => {
        const lastWord = last(words(y))
        const star = y.indexOf('* as ')
        const hasBrace = y.indexOf('{')
        const starImport = y.slice(star + 3, y.indexOf('from'))
        /* eslint-disable no-console */
        console.log({ starImport, y, star, hasBrace })
        let allImported =
          hasBrace > -1
            ? y
                .slice(hasBrace + 1, y.indexOf('}'))
                .split(',')
                .map(z => z.trim())
                .map(z => {
                  const as = z.indexOf('as')
                  return as > -1 ? [z.slice(0, as - 1), z.slice(as + 3)] : z
                })
                .filter(I)
            : star > -1
              ? starImport
              : y.replace(/import (.*) from (.*)/, '$1')
        if (!isArray(allImported)) {
          allImported = [allImported]
        }
        log('checks', { one: hasBrace > -1, two: star > -1 })
        log('ALLLLLLLL', allImported)
        const aliased = fromPairs(filter(isArray, allImported))
        log('ALIASED', aliased)
        const unaliased = reject(isArray, allImported)
        const domain = when(
          complement(isArray),
          pipe(values, filter(I), log('@@@'), concat($, unaliased))
        )(aliased)
        console.log('DOMAIN', domain)
        const usage = Array.isArray(domain)
          ? pipe('any in', yin => regex(yin, 'g'), any, log('any out'))(domain)
          : {}
        console.log('usage!', usage)
        const used = pipe(zip(domain), log('zipped?'), toPairs)(usage)
        return {
          used,
          domain,
          aliased,
          unaliased,
          from: lastWord.slice(1, -1),
        }
      })
    )(rawImports)
  },
}

export default plugin
