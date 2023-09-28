import {
  curry,
  reject,
  reduce,
  pipe,
  map,
  findIndex,
  propEq,
  last,
} from 'ramda'

import { insertAfter } from './list'
import { log } from './trace'

export const without = curry((name, x) => reject(propEq('name', name), x))
export const topologicalDependencySort = raw =>
  pipe(
    map(rawPlug => rawPlug?.default ?? rawPlug),
    defaulted =>
      reduce(
        (agg, plugin) => {
          const { name, dependencies = [] } = plugin
          const cleaned = without(name, agg)
          return pipe(
            map(d => findIndex(propEq('name', d), cleaned)),
            z => z.sort(),
            last,
            (ix = -1) => insertAfter(ix, plugin, cleaned)
          )(dependencies)
        },
        defaulted,
        defaulted
      )
  )(raw)
