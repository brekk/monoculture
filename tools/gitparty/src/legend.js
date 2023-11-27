import { pipe, map, toPairs, curry, join } from 'ramda'

export const legendBlocks = curry((chalk, x) =>
  pipe(
    toPairs,
    map(([k, v]) => `${v.fn(` ${v.key} `)} = ${k}`),
    join(' ')
  )(x)
)
export const printLegend = curry((chalk, x) =>
  pipe(legendBlocks(chalk), y => `LEGEND: ${y}\n`)(x)
)
