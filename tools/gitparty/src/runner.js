import path from 'node:path'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { printLegend } from './legend'
import { trace } from 'xtrace'
import { configFileWithCancel, configurate } from 'climate'
import { Chalk } from 'chalk'
import {
  swap,
  mapRej,
  resolve,
  coalesce,
  reject as rejectF,
  ap as apF,
  and as andF,
} from 'fluture'
import { writeFileWithConfigAndCancel, findUpWithCancel } from 'file-system'
import {
  zip,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes,
  mergeRight,
  objOf,
  propOr,
  reject,
  startsWith,
  toPairs,
  uniq,
  __ as $,
  ap,
  cond,
  curry,
  always as K,
  map,
  chain,
  F,
  T,
  pipe,
} from 'ramda'
import { canonicalize } from './alias'
import {
  THIS_IS_NOT_A_GIT_REPO,
  CONFIG_NOT_VALID,
  GITPARTY_CONFIG_NEEDED,
} from './errors'
import {
  DEFAULT_CONFIG_FILE,
  YARGS_CONFIG,
  CONFIG_DEFAULTS,
  HELP_CONFIG,
} from './config'
import { gitlogWithCancel } from './git'
import { log } from './log'
import PKG from '../package.json'

const j2 = x => JSON.stringify(x, null, 2)

const { name: $NAME, description: $DESC } = PKG

const writeInitConfigFileWithCancel = curry((cancel, filepath) =>
  pipe(
    j2,
    writeFileWithConfigAndCancel(cancel, { encoding: 'utf8' }, filepath),
    map(K(`Wrote file to "${filepath}"!`))
  )(DEFAULT_CONFIG_FILE)
)

const loadPartyFile = curry(
  (cancel, { cwd, color: useColor, config, help, HELP, init }) => {
    const chalk = new Chalk({ level: useColor ? 2 : 0 })
    return pipe(
      cond([
        [
          K(init),
          () =>
            pipe(
              writeInitConfigFileWithCancel(cancel),
              swap
            )(path.resolve(cwd, '.gitpartyrc')),
        ],
        [K(help), K(resolve(HELP))],
        [
          T,
          pipe(
            log.configFile('trying to load config...'),
            configFileWithCancel(cancel),
            map(log.configFile('loaded...')),
            mapRej(
              pipe(
                log.configFile('error...'),
                propOr('', 'message'),
                cond([
                  [
                    includes('No config file found'),
                    K(GITPARTY_CONFIG_NEEDED(chalk)),
                  ],
                  [startsWith('SyntaxError'), K(CONFIG_NOT_VALID)],
                  [T, I],
                ])
              )
            )
          ),
        ],
      ])
    )(
      config || {
        ns: PKG.name,
      }
    )
  }
)

export const loadGitData = curry((cancel, chalk, data) =>
  pipe(
    log.config('searching for .git/index'),
    findUpWithCancel(cancel, {}),
    map(log.config('git found, path...')),
    map(path.dirname),
    chain(repo =>
      repo
        ? gitlogWithCancel(cancel, { repo })
        : rejectF(THIS_IS_NOT_A_GIT_REPO(chalk))
    ),
    map(pipe(objOf('gitlog'), mergeRight(data)))
  )(['.git/index'])
)

const adjustRelativeTimezone = curry((tz, commit) => {
  const { authorDate } = commit
  const newDate = (
    tz.toLowerCase() === 'utc'
      ? zonedTimeToUtc
      : pipe(zonedTimeToUtc, x => utcToZonedTime(x, tz))
  )(authorDate)
  commit.authorDate = newDate
  return commit
})
const deriveAuthor = curry((lookup, commit) => {})

const getFiletype = z => z.slice(z.indexOf('.'), Infinity)

const getFiletypes = commit =>
  pipe(
    propOr([], 'files'),
    map(getFiletype),
    uniq,
    objOf('filetypes'),
    mergeRight(commit)
  )(commit)

export const processData = curry((chalk, config, data) => {
  return pipe(
    map(adjustRelativeTimezone(config.timezone)),
    config.excludeMergeCommits
      ? reject(pipe(propOr('', 'subject'), startsWith('Merge')))
      : I,
    map(getFiletypes),
    map(raw =>
      pipe(
        x => [x],
        ap([propOr([], 'status'), propOr([], 'files')]),
        ([a, z]) => zip(a, z),
        groupBy(head),
        objOf('changes'),
        mergeRight(raw),
        z => mergeRight(z, { statuses: uniq(z.status) })
      )(raw)
    )
  )(data)
})

export const runner = curry((cancel, argv) => {
  let canon
  return pipe(
    v => {
      const cwd = process.cwd()
      return configurate(
        YARGS_CONFIG,
        { ...CONFIG_DEFAULTS, repo: cwd, cwd },
        HELP_CONFIG,
        {
          name: $NAME,
          description: $DESC,
        },
        v
      )
    },
    map(log.config('parsed args...')),
    chain(config => {
      // setup chalk
      const chalk = new Chalk({ level: config.color ? 2 : 0 })
      return pipe(
        loadPartyFile(cancel),
        // mash the data together
        map(partyFile => ({ config, partyFile, chalk })),
        chain(loadGitData(cancel, chalk))
      )(config)
    }),
    map(({ config, partyFile, gitlog, chalk }) => {
      canon = canonicalize({})
      return pipe(
        propOr({}, 'patterns'),
        map(v =>
          v?.matches
            ? mergeRight(v, { fn: chalk[v.color], matches: v.matches })
            : v
        ),
        // z => [z],
        printLegend(chalk),
        // ap([printLegend(chalk), processData(chalk, config)])
        legend => processData(chalk, config, gitlog)
      )(partyFile)
    })
  )(argv)
})
