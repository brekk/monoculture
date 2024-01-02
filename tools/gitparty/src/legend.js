import { pipe, map, toPairs, curry, join } from 'ramda'

export const legendBlocks = curry(function _legendBlocks(chalk, x) {
  return pipe(
    toPairs,
    map(([k, v]) => `${v.fn(` ${v.key} `)} = ${k}`),
    join(' ')
  )(x)
})
export const printLegend = curry(function _printLegend(chalk, x) {
  return pipe(legendBlocks(chalk), y => `LEGEND: ${y}\n`)(x)
})
