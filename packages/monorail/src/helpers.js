import {
  __ as $,
  any,
  ap,
  curry,
  defaultTo,
  filter,
  find,
  findLast,
  head,
  last,
  length,
  lt,
  map,
  pipe,
  propOr,
  reduce,
  slice,
  test,
} from 'ramda'
import { trace } from 'xtrace'

export const getBody = propOr([], 'body')

export const bodyTest = curry((fn, file, needle) =>
  pipe(getBody, fn(pipe(last, test(needle))))(file)
)
export const _reduce = curry((file, fn, initial) =>
  pipe(getBody, reduce(fn, initial))(file)
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
    ap([onLine($, start), onLastLine($, end), getBody]),

    ([a, z, body]) =>
      a === -1 || z === -1
        ? []
        : filter(([line]) => a <= line && line <= z)(body)
  )(file)
)
export const selectAll = curry((file, start, end) =>
  pipe(
    getBody,
    reduce(
      ({ active, all, current }, [line, content]) => {
        const testContent = test($, content)
        const checkStart = testContent(start)
        const stillActive = checkStart || active
        if (stillActive) {
          const newCurrent = current.concat([line, content])
          const checkEnd = testContent(end)
          if (checkEnd) {
            return {
              active: false,
              all: all.concat([newCurrent]),
              current: [],
            }
          }
          return {
            active: !checkEnd,
            all,
            current: newCurrent,
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
  reduce: _reduce(file),
})
