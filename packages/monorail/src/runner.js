import {
  pathOr,
  curry,
  fromPairs,
  identity as I,
  map,
  mergeRight,
  pipe,
  prop,
  reduce,
} from 'ramda'
import { pap, resolve } from 'fluture'
import { topologicalDependencySort } from './sort'
import { log } from './trace'

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

export const stepFunction = curry(
  (state, { selector = I, preserveLine = false, fn }, file) => {
    const selected = selector(state)
    const output = preserveLine
      ? {
          ...file,
          body: map(([k, v]) => [k, fn(selected, v)])(file.body),
        }
      : fn(selected, file)
    // log.run('transforming...', file.file)
    // log.run('transformed...', output)
    return output
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

export const futureApplicator = curry((context, plugins, files) => ({
  state: pipe(
    map(plugin => {
      log.run('plugin', {
        name: plugin.name,
        dependencies: plugin.dependencies,
      })
      return [
        plugin.name,
        pipe(
          map(file => [file.hash, stepFunction(context, plugin, file)]),
          fromPairs
        )(files),
      ]
    }),
    z => {
      log.run(
        'state updated...',
        map(([k]) => k, z)
      )
      return z
    },
    fromPairs
  )(plugins),
  files,
  hashes: pipe(
    map(z => [prop('hash', z), prop('file', z)]),
    fromPairs
  )(files),
  plugins: map(prop('name'), plugins),
}))

export const futureFileProcessor = curry((context, pluginsF, filesF) =>
  pipe(
    pap(map(topologicalDependencySort, pluginsF)),
    pap(filesF)
  )(resolve(futureApplicator(context)))
)
