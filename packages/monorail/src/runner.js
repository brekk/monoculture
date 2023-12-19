import {
  of,
  ap,
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
import { toposort } from './sort'
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
    return output
  }
)

const runPluginOnFilesWithContext = curry((context, files, plugin) => {
  if (!plugin.name) return []
  log.run('plugin', plugin)
  return [
    plugin.name,
    pipe(
      map(file => [file.name, stepFunction(context, plugin, file)]),
      fromPairs
    )(files),
  ]
})

const applyState = curry((context, files, plugins) =>
  pipe(
    // assume all plugins are at 0, and reject any which aren't
    reject(pipe(propOr(0, 'level'), complement(equals)(0))),
    trace('yoho'),
    // this doesn't yet work because we need chain and this is the same synchronous tick
    reduce(
      (agg, plugin) =>
        agg.concat([runPluginOnFilesWithContext(context, files, plugin)]),
      []
    ),
    z => {
      log.run(
        'state updated...',
        map(([k]) => k, z)
      )
      return z
    },
    fromPairs
  )(plugins)
)

export const getNames = map(prop('name'))
export const getHashes = pipe(
  map(z => [prop('hash', z), prop('name', z)]),
  fromPairs
)

export const futureApplicator = curry((context, plugins, files) => {
  const firstPass = {
    state: applyState(context, files, plugins),
    // files,
    filenames: getNames(files),
    hashes: getHashes(files),
    plugins: getNames(plugins),
  }
  return firstPass
  // eventually we should do a pre-lookup on all levels and then make this dynamically repeat
  /*
  return pipe(
    filter(pipe(propOr(0, 'level'), equals(1))),
    map(runPluginOnFilesWithContext({ ...context, ...firstPass }, files)),
    fromPairs,
    state2 => ({ ...firstPass, state: { ...firstPass.state, ...state2 } })
  )(plugins)
  */
})

export const futureFileProcessor = curry((context, pluginsF, filesF) =>
  pipe(
    pap(map(toposort, pluginsF)),
    pap(filesF)
  )(resolve(futureApplicator(context)))
)
