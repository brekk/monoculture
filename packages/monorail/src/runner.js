import {
  of,
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
import { ap, pap, resolve } from 'fluture'
import { makeHelpers } from './helpers'
import { toposort } from './sort'
import { log } from './trace'
import { trace } from 'xtrace'

export const stepFunction = curry((state, plugin, file) => {
  const { selector = I, preserveLine = false, fn } = plugin
  const selected = selector(state)
  const helpers = makeHelpers(file)
  const output = preserveLine
    ? {
        ...file,
        body: map(([k, v]) => [k, fn(selected, v, helpers)])(file.body),
      }
    : fn(selected, file, helpers)
  return output
})

const runPluginOnFilesWithContext = curry((context, files, plugin) => {
  if (!plugin.name) return []
  log.run('plugin', plugin)
  return pipe(
    map(file => [file.name, stepFunction(context, plugin, file)]),
    fromPairs
  )(files)
})

export const getNames = map(prop('name'))
export const getHashes = pipe(
  map(z => [prop('name', z), prop('hash', z)]),
  fromPairs
)

export const statefulApplicator = curry((context, plugins, files) => {
  const { HELP: _HELP, ...configuration } = context
  return reduce(
    (agg, plugin) => {
      const run = pipe(runPluginOnFilesWithContext(agg, files))(plugin)
      return log.run(`applying ${plugin.name}...`, {
        ...agg,
        state: { ...agg.state, [plugin.name]: run },
      })
    },
    {
      state: {},
      filenames: getNames(files),
      hashes: getHashes(files),
      plugins: getNames(plugins),
      configuration,
    },
    plugins
  )
})

export const futureFileProcessor = curry((context, pluginsF, filesF) => {
  const sortedPluginsF = map(toposort, pluginsF)
  return pipe(
    ap(sortedPluginsF),
    ap(filesF)
  )(resolve(statefulApplicator(context)))
})
