import {
  curry,
  pipe,
  reduce,
  identity as I,
  mergeRight,
  prop,
  map,
  fromPairs,
} from 'ramda'
import { topologicalDependencySort } from './sort'

export const taskProcessor = curry((context, plugins) =>
  pipe(
    topologicalDependencySort,
    reduce(
      (
        { state, events },
        { name, fn, selector = I, store: __focus = false }
      ) => {
        const store = __focus || I
        const outcome = fn(selector(state))
        const newState = { ...state, [name]: outcome }
        return {
          events: [...events, [name, outcome]],
          state: __focus ? store(newState) : newState,
        }
      },
      { state: context, events: [] }
    )
  )(plugins)
)

// files: List { file :: string, body :: List [Number, String] }
export const fileProcessor = curry((context, plugins, files) =>
  pipe(
    topologicalDependencySort,
    reduce(
      (
        // context
        { state, events },
        // plugin
        { name, fn, selector = I, store: __focus = false, processLine = false }
      ) => {
        const store = __focus || I
        const outcome = reduce((agg, __file) => {
          const selected = selector(state)
          const { hash } = __file
          const step = f =>
            processLine
              ? {
                  ...f,
                  body: pipe(raw => fn(selected, raw))(f.body),
                }
              : fn(selected, f)
          // I figure we wanna keep things as arrays for lookups
          // but might entirely change this with respect to futures over time
          return [...agg, [hash, step(__file)]]
        }, [])(files)
        const newState = { ...state, [name]: outcome }
        return {
          events: [...events, name],
          state: __focus ? store(newState) : newState,
        }
      },
      { state: context, events: [] }
    ),
    mergeRight({
      files,
      hashMap: pipe(
        map(x => [prop('hash', x), prop('file', x)]),
        fromPairs
      )(files),
    })
  )(plugins)
)
