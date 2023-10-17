import {
  length,
  lt,
  reduce,
  __ as $,
  ap,
  findLast,
  slice,
  defaultTo,
  map,
  filter,
  find,
  head,
  curry,
  propOr,
  any,
  pipe,
  last,
  test,
} from 'ramda'
import { trace } from 'xtrace'

export const bodyTest = curry((fn, file, needle) =>
  pipe(propOr([], 'body'), fn(pipe(last, test(needle))))(file)
)

export const _any = bodyTest(any)

export const onLines = curry((file, needle) =>
  pipe(bodyTest(filter, file), map(head))(needle)
)

export const onLine = curry((file, needle) =>
  pipe(bodyTest(find, file), defaultTo([-1]), head)(needle)
)
export const onLastLine = curry((file, needle) =>
  pipe(bodyTest(findLast, file), defaultTo([-1]), head)(needle)
)

export const selectBetween = curry((file, start, end) =>
  pipe(
    z => [z],
    ap([onLine($, start), onLastLine($, end), propOr([], 'body')]),

    ([a, z, body]) =>
      a === -1 || z === -1
        ? []
        : filter(([line]) => a <= line && line <= z)(body)
  )(file)
)
export const selectAll = curry((file, start, end) =>
  pipe(
    propOr([], 'body'),
    reduce(
      ({ active, all, current }, [line, content]) => {
        const checkStart = test(start, content)
        const checkEnd = test(end, content)
        const stillActive = checkStart || active
        if (stillActive) {
          if (checkEnd) {
            return {
              active: false,
              all: all.concat([current.concat([line, content])]),
              current: [],
            }
          }
          return {
            active: !checkEnd,
            all,
            current: current.concat([line, content]),
          }
        }
        return {
          active: false,
          all: all.concat([current]),
          current: [],
        }
      },
      { active: false, all: [], current: [] }
    ),
    propOr([], 'all'),
    filter(pipe(length, lt(0)))

    // z => JSON.stringify(z, null, 2)
    // reduce((agg, [line, content]) =>
  )(file)
)

export const _filter = bodyTest(filter)

export const makeHelpers = file => ({
  any: _any(file),
  onLines: onLines(file),
  onLine: onLine(file),
  filter: _filter(file),
  between: selectBetween(file),
  selectAll: selectAll(file),
})
