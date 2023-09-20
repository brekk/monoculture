import {
  all,
  applySpec,
  curry,
  equals,
  keys,
  pipe,
  propOr,
  reduce,
  reject,
  values,
} from 'ramda'

export const kindIs = curry((expected, x) => equals(expected, typeof x))

export const coerce = x => !!x

export const testPlugin = applySpec({
  // unique identifier for the plugin
  name: pipe(propOr(false, 'name'), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe(propOr(false, 'fn'), kindIs('function')),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe(
    propOr(() => {}, 'selector'),
    kindIs('function')
  ),
  // store
  store: pipe(
    propOr(() => {}, 'store'),
    kindIs('function')
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe(propOr([], 'dependencies'), Array.isArray),
})

export const checkPlugin = pipe(testPlugin, values, all(equals(true)))

export const validatePlugins = reduce((agg, plugin) => {
  const check = checkPlugin(plugin)
  const name = propOr('unnamed', 'name', plugin)
  if (!check) {
    const err = [name, pipe(testPlugin, reject(equals(true)), keys)(plugin)]
    return {
      ...agg,
      incorrect: agg.incorrect ? [...agg.incorrect, err] : [err],
    }
  }
  return {
    ...agg,
    correct: agg.correct ? [...agg.correct, name] : [name],
  }
}, {})
