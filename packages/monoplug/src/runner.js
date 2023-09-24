import {
  curry,
  propOr,
  pipe,
  reduce,
  identity as I,
  mergeRight,
  prop,
  map,
  fromPairs,
} from 'ramda'
import { pap, resolve } from 'fluture'
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

const stepFunction = curry(
  (state, { selector = I, preserveLine = false, fn }, file) => {
    const selected = selector(state)
    return preserveLine
      ? {
          ...file,
          body: map(([k, v]) => [k, fn(selected, v)])(file.body),
        }
      : fn(selected, file)
  }
)

const processRelativeToFile = curry((state, plugin, files) =>
  reduce(
    (agg, __file) => {
      const { hash } = __file
      return [...agg, [hash, stepFunction(state, plugin, __file)]]
    },
    [],
    files
  )
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
        plugin
      ) => {
        const { store = I, name } = plugin
        const outcome = processRelativeToFile(state, plugin, files)
        const newState = { ...state, [name]: outcome }
        return {
          events: [...events, name],
          state: store(newState),
        }
      },
      { state: context, events: [] }
    ),
    mergeRight({
      hashMap: pipe(
        map(x => [prop('hash', x), prop('file', x)]),
        fromPairs
      )(files),
    })
  )(plugins)
)

export const futureFileProcessor = curry((context, pluginsF, filesF) =>
  pipe(pap(pluginsF), pap(filesF))(resolve(fileProcessor(context)))
)
