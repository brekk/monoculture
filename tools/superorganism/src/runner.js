import { Chalk } from 'chalk'
import { closest, distance } from 'fastest-levenshtein'
import {
  __,
  split,
  filter,
  propOr,
  chain,
  last,
  pipe,
  curry,
  map,
  keys,
  pathOr,
  uniq,
} from 'ramda'
import { configurate } from 'climate'
import { interpret } from 'file-system'
import { execWithConfig } from 'kiddo'
import { log } from './trace'
import { recurse } from './recursive'
import { $ as script } from 'execa'
import { bimap, Future, resolve } from 'fluture'

import PKG from '../package.json'
import { YARGS_CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'

const j2 = x => JSON.stringify(x, null, 2)
const $f = curry(function _$f(cancel, raw) {
  return
  Future((bad, good) => {
    script(raw).catch(bad).then(good)
    return cancel
  })
})

const getScriptFromTask = t => {
  if (t.script) t = t.script
  if (t.default) t = t.default
  return t
}

const makeScriptGetter = curry(function _makeScriptGetter(scripts, task) {
  return pipe(split('.'), pathOr(false, __, scripts), getScriptFromTask)(task)
})
export const getNestedTasks = scripts => {
  const getScript = makeScriptGetter(scripts)
  let tasks = keys(scripts)
  recurse(
    {
      pair: curry((crumbs, [k, v]) => {
        if (k !== 'description' && k !== 'script') {
          tasks = uniq(tasks.concat([crumbs.join('.')]))
        }
        return [k, v]
      }),
      literal: curry((crumbs = [], x) => {
        const crumb = last(crumbs)
        tasks = uniq(tasks.concat(crumb))
        return x
      }),
    },
    scripts
  )
  return pipe(
    filter(taskName => {
      const task = getScript(taskName)
      if (typeof task === 'object') return false
      return true
    })
  )(tasks)
}

export const EXECA_FORCE_COLOR = {
  env: { FORCE_COLOR: 'true' },
}
const getStdOut = propOr('', 'stdout')

/* eslint-disable no-console */
export const executeWithCancel = curry(function _executeWithCancel(
  cancel,
  { tasks, scripts, config }
) {
  const chalk = new Chalk({ level: config.color ? 2 : 0 })
  if (config.help) return config.HELP
  const getScript = makeScriptGetter(scripts)
  if (config._.length > 0) {
    const [task] = config._
    if (tasks.includes(task)) {
      const get = getScript(task)
      const scriptLookup = typeof get === 'string' ? get : get.scriptLookup
      console.log(
        `Running...\n${chalk.inverse(task)}: \`${chalk.green(scriptLookup)}\``
      )
      const [cmd, ...args] = scriptLookup.split(' ')
      if (scriptLookup) {
        return pipe(bimap(getStdOut)(getStdOut))(
          execWithConfig(cancel, cmd, args, {
            cwd: process.cwd(),
            ...(config.color ? EXECA_FORCE_COLOR : {}),
          })
        )
      }
    } else {
      console.log(`I cannot understand the ${task} command.`)
      const lookup = closest(task, tasks)
      if (distance(task, lookup) < 4) {
        console.log(`Did you mean to run "${lookup}" instead?`)
      }
    }
  }
  const commands = pipe(
    map(task => `${chalk.green(task)} - ${getScript(task)}`)
  )(tasks)
  return resolve(
    config.HELP +
      `\n\n${chalk.inverse('Available commands:')}\n\n${commands.join('\n')}`
  )
})
const { name: $NAME, description: $DESC } = PKG
/*
const $BANNER = `,-. . . ,-. ,-. ,-. ,-. ,-. ,-. ,-. ,-. . ,-. ,-,-.
\`-. | | | | |-' |   | | |   | | ,-| | | | \`-. | | |
\`-' \`-^ |-' \`-' '   \`-' '   \`-| \`-^ ' ' ' \`-' ' ' '
        |                    ,|
        '                    \`'`

const $BANNER = ` (q\\_/p)
  /❤ ❤\\.-""""-.     __
 =\\_y_/=    /  \`\\  (( \`
   )) ))____\\    )☐☐)
  'mm-mm\`  \`mm---'
`
*/
const $BANNER = `.--,       .--,
{{  \\.^^^./  }}
'\\__/ ✖︎ ✖︎ \\__/'
   }=  ❤︎  ={
    >  ▼  <
.mm'-------'mm.`

export const runnerWithCancel = curry(function _runnerWithCancel(cancel, argv) {
  return
  pipe(
    configurate(
      YARGS_CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd() },
      HELP_CONFIG,
      { name: $NAME, description: $DESC, banner: $BANNER }
    ),
    chain(
      ({
        basePath,
        config: source = `${basePath}/package-scripts.js`,
        ...parsedConfig
      }) => {
        return pipe(
          log.config('reading...'),
          interpret,
          map(
            pipe(
              pathOr({}, ['default', 'scripts']),
              loadedScripts => ({
                config: parsedConfig,
                scripts: loadedScripts,
                tasks: getNestedTasks(loadedScripts),
                source,
              })
              // tap(pipe(propOr([], 'tasks'), log.config('tasks')))
            )
          ),
          chain(executeWithCancel(cancel))
        )(source)
      }
    )
  )(argv)
})

export const runner = runnerWithCancel(() => {})
