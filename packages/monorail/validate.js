import {
  of,
  ap,
  without,
  all,
  applySpec,
  equals,
  keys,
  pipe,
  propOr,
  reduce,
  reject,
  values,
} from 'ramda'
import { isType, isArray } from 'inherent'

export const coerce = x => !!x

const isFunction = isType('function')
const isBool = isType('boolean')

export const PLUGIN_SHAPE = {
  // unique identifier for the plugin
  name: pipe(propOr(false, 'name'), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe(propOr(false, 'fn'), isFunction),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe(
    propOr(() => {}, 'selector'),
    isFunction
  ),
  preserveOffset: x => {
    const { preserveOffset: p = true } = x
    return isBool(p)
  },
  preserveLine: x => {
    const { preserveLine: p = true } = x
    return isBool(p)
  },
  // store
  store: pipe(
    propOr(() => {}, 'store'),
    isFunction
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe(propOr([], 'dependencies'), isArray),
}
export const EXPECTED_KEYS = keys(PLUGIN_SHAPE)
export const noExtraKeys = x =>
  pipe(keys, without(EXPECTED_KEYS), y =>
    y.length ? `Found additional or misspelled keys: [${y.join(', ')}]` : ``
  )(x)

export const testPlugin = pipe(
  of,
  ap([applySpec(PLUGIN_SHAPE), noExtraKeys]),
  ([x, error]) => (error ? { ...x, error } : x)
)

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
