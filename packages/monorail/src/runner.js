import {
  objOf,
  reject,
  propOr,
  complement,
  equals,
  filter,
  propEq,
  curry,
  applySpec,
  fromPairs,
  identity as I,
  map,
  mergeRight,
  pipe,
  prop,
  reduce,
} from 'ramda'
import { pap, resolve } from 'fluture'
import { makeHelpers } from './helpers'
import { topologicalDependencySort } from './sort'
import { log } from './trace'
import { trace } from 'xtrace'

export const stepFunction = curry(
  (state, { name, selector = I, preserveLine = false, fn }, file) => {
    const selected = selector(state)
    const helpers = makeHelpers(file)
    const output = preserveLine
      ? {
          ...file,
          body: map(([k, v]) => [k, fn(selected, v, helpers)])(file.body),
        }
      : fn(selected, file, helpers)
    // log.run('transforming...', file.file)
    // log.run('transformed...', output)
    return output
  }
)

const runPluginOnFilesWithContext = curry((context, files, plugin) => {
  if (!plugin.name) return []
  log.run('plugin', plugin)
  return [
    plugin.name,
    pipe(
      map(file => [file.file, stepFunction(context, plugin, file)]),
      fromPairs
    )(files),
  ]
})

export const futureApplicator = curry((context, plugins, files) =>
  pipe(
    f => ({
      state: pipe(
        // assume all plugins are at 0, and reject any which aren't
        reject(pipe(propOr(0, 'level'), complement(equals)(0))),
        map(runPluginOnFilesWithContext(context, files)),
        z => {
          log.run(
            'state updated...',
            map(([k]) => k, z)
          )
          return z
        },
        fromPairs
      )(plugins),
      files: f,
      hashes: pipe(
        map(z => [prop('hash', z), prop('file', z)]),
        fromPairs
      )(f),
      plugins: map(prop('name'), plugins),
    }),
    // eventually we should do a pre-lookup on all levels and then make this dynamically repeat
    firstPass =>
      pipe(
        filter(pipe(propOr(0, 'level'), equals(1))),
        map(runPluginOnFilesWithContext({ ...context, ...firstPass }, files)),
        fromPairs,
        state2 => ({ ...firstPass, state: { ...firstPass.state, ...state2 } })
      )(plugins)
  )(files)
)

export const futureFileProcessor = curry((context, pluginsF, filesF) =>
  pipe(
    pap(map(topologicalDependencySort, pluginsF)),
    pap(filesF)
  )(resolve(futureApplicator(context)))
)
