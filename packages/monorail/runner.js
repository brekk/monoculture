import {
  curry,
  fromPairs,
  tap,
  identity as I,
  map,
  pipe,
  prop,
  reduce,
} from 'ramda'
import { pap, resolve } from 'fluture'
import { makeFileHelpers, makePluginHelpers } from './helpers'
import { toposort } from './sort'
import { log } from './log'

export const stepFunction = curry(function _stepFunction(state, plugin, file) {
  tap(({ name, dependencies: d }) => log.run(`plugin [${name}]`, d))
  tap(({ name, hash }) => log.run(`file [${name}]`, hash))
  const { selector = I, preserveLine = false, fn } = plugin
  const selected = selector(state)
  const base = makeFileHelpers(file)
  const plugged = makePluginHelpers(state, plugin, log)
  const helpers = { ...base, ...plugged }
  const output = preserveLine
    ? {
        ...file,
        body: map(([k, v]) => [k, fn(selected, v, helpers)])(file.body),
      }
    : fn(selected, file, helpers)
  return output
})

const runPluginOnFilesWithContext = curry(
  function _runPluginOnFilesWithContext(context, files, plugin) {
    if (!plugin.name) return []
    log.run('applying plugin', plugin.name)
    return pipe(
      map(file => [file.name, stepFunction(context, plugin, file)]),
      fromPairs
    )(files)
  }
)

export const getNames = map(prop('name'))
export const getHashes = pipe(
  map(z => [prop('name', z), prop('hash', z)]),
  fromPairs
)

export const statefulApplicator = curry(
  function _statefulApplicator(context, plugins, files) {
    // drop info we don't want to retain downstream
    const { HELP: _h, basePath: _b, cwd: _c, ...config } = context
    return reduce(
      (agg, plugin) => ({
        ...agg,
        state: {
          ...agg.state,
          [plugin.name]: pipe(runPluginOnFilesWithContext(agg, files))(plugin),
        },
      }),
      {
        state: {},
        filenames: getNames(files),
        hashes: getHashes(files),
        plugins: getNames(plugins),
        config,
      },
      plugins
    )
  }
)

export const futureFileProcessor = curry((context, pluginsF, filesF) =>
  pipe(
    resolve,
    pap(map(toposort, pluginsF)),
    pap(filesF)
  )(statefulApplicator(context))
)
