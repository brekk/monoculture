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

/**
 * @pageSummary Built-in helpers for making custom plugins more robust. The "helpers" are the third parameter passed to a custom plugin's function.
 * @page helpers
 */

export const getBody = propOr([], 'body')

export const bodyTest = curry((fn, file, needle) =>
  pipe(getBody, fn(pipe(last, test(needle))))(file)
)

/**
 * Use this helper to test a regex that matches against any single incidence on any line
 * @name any
 * @example
 * ```js
 * const plugin = {
 *   name: 'get-const',
 *   fn: (state, file, { any }) => any(/const/)
 * }
 * export default plugin
 * ```
 */
export const _any = bodyTest(any)

/**
 * Use this helper to test a regex that matches and filters against every line
 * @name lines
 * @example
 * ```js
 * export default {
 *   name: 'unexported-consts',
 *   fn: (state, file, { lines }) => lines(/^const/)
 * }
 * ```
 */
export const onLines = curry((file, needle) =>
  pipe(bodyTest(filter, file), map(head))(needle)
)

/**
 * Use this helper to test a regex that matches and finds the first matching line
 * @name line
 * @example
 * ```js
 * export default {
 *   name: 'exported-default',
 *   fn: (state, file, { line }) => line(/export default/g)
 * }
 * ```
 */
export const onLine = curry((file, needle) =>
  pipe(bodyTest(find, file), defaultTo([-1]), head)(needle)
)

/**
 * Use this helper to test a regex that matches and finds the last matching line
 * @name lastLine
 * @example
 * ```js
 * export default {
 *   name: 'exported-last',
 *   fn: (state, file, { lastLine }) => lastLine(/export/g)
 * }
 * ```
 */
export const onLastLine = curry((file, needle) =>
  pipe(bodyTest(findLast, file), defaultTo([-1]), head)(needle)
)

/**
 * Use this helper to select content between two repeating regular expressions
 * @name between
 * @example
 * ```js
 * export default {
 *   name: 'expanded-imports',
 *   fn: (state, file, { between }) => between(/^import/, /from (.*)/)
 * }
 * ```
 */
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

/**
 * Use this helper to select all content between two repeating regular expressions
 * @name selectAll
 * @example
 * ```js
 * export default {
 *   name: 'expanded-imports',
 *   fn: (state, file, { selectAll }) => selectAll(/^import/, /from (.*)/)
 * }
 * ```
 */
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

/**
 * Use this helper to easily reduce over all lines and aggregate a value
 * @name reduce
 * @example
 * ```js
 * const plugin = {
 *   name: 'select-specifics',
 *   fn: (state, file, { reduce }) => reduce((agg, [line, content]) => content.length > 10 : agg.concat(content) : agg, [])
 * }
 * export default plugin
 * ```
 */
export const _reduce = curry((file, fn, initial) =>
  pipe(getBody, reduce(fn, initial))(file)
)

/**
 * Use this helper to easily filter all lines related to a given regular expression
 * @name filter
 * @example
 * ```js
 * const plugin = {
 *   name: 'keyword-match',
 *   fn: (state, file, { config, filter }) => filter(
 *     config?.keyword ?? /monorail/
 *   )
 * }
 * export default plugin
 * ```
 */
export const _filter = bodyTest(filter)

export const makeFileHelpers = file => ({
  any: _any(file),
  onLines: onLines(file),
  onLine: onLine(file),
  onLastLine: onLastLine(file),
  filter: _filter(file),
  between: selectBetween(file),
  selectAll: selectAll(file),
  reduce: _reduce(file),
})

/**
 * The `config` value is patched in so that it is easier to pass values from the rulefile configuration to the plugins themselves, scoped to the plugin name.
 * @name config
 * @example
 * ```js
 * const plugin = {
 *   name: 'keyword-match',
 *   fn: (state, file, { filter, config }) => filter(
 *     config?.keyword ?? /monorail/
 *   )
 * }
 * export default plugin
 * ```
 */
export const _getConfigFrom = curry((name, c) => c?.config?.[name])

export const makePluginHelpers = curry((state, plugin) => ({
  config: _getConfigFrom(plugin.name, state),
}))
