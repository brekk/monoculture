import path from 'node:path'
import { parse as parseTime } from 'date-fns'
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format as formatDate,
} from 'date-fns-tz'
import {
  renderPatterns,
  renderPatternsWithAlt,
  subrender,
  renderPattern,
  applyPatterns,
} from './per-commit'
import { printLegend } from './legend'
import { trace } from 'xtrace'
import { configFileWithCancel, configurate } from 'climate'
import { Chalk } from 'chalk'
import { strepeat, box, getBorderWidth } from 'clox'
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
import strlen from 'string-length'
import {
  reduce,
  applySpec,
  F,
  T,
  __ as $,
  always as K,
  ap,
  join,
  replace,
  chain,
  cond,
  curry,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes,
  map,
  mergeRight,
  objOf,
  pipe,
  prop,
  propOr,
  reject,
  split,
  startsWith,
  toPairs,
  uniq,
  zip,
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

const unlines = join('\n')

const BAR = `│`
const NEWBAR = `\n${BAR}`

const j2 = x => JSON.stringify(x, null, 2)

const { name: $NAME, description: $DESC } = PKG

const writeInitConfigFileWithCancel = curry((cancel, filepath) =>
  pipe(
    j2,
    writeFileWithConfigAndCancel(cancel, { encoding: 'utf8' }, filepath),
    map(K(`Wrote file to "${filepath}"!`))
  )(DEFAULT_CONFIG_FILE)
)

const getAggregatePatterns = curry((chalk, partyFile, data) => {
  const aggCommit = reduce(
    (agg, y) =>
      mergeRight(
        agg,
        mergeRight(y, { files: uniq((y.files || []).concat(agg.files || [])) })
      ),
    {},
    data
  )
  return renderPatternsWithAlt(
    chalk.inverse('   '),
    partyFile.patterns,
    aggCommit
  )
})

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

export const loadGitData = curry((cancel, config, chalk, data) => {
  const { fields: _fields = [] } = config
  const fields = [
    ...CONFIG_DEFAULTS.fields,
    ...(!Array.isArray(_fields) ? [_fields] : _fields),
  ]
  return pipe(
    log.config('searching for .git/index'),
    findUpWithCancel(cancel, {}),
    map(log.config('git found, path...')),
    map(path.dirname),
    chain(repo =>
      repo
        ? gitlogWithCancel(cancel, {
            repo,
            number: config.totalCommits,
            fields,
          })
        : rejectF(THIS_IS_NOT_A_GIT_REPO(chalk))
    ),
    map(pipe(objOf('gitlog'), mergeRight(data)))
  )(['.git/index'])
})

const adjustRelativeTimezone = curry((timeZone, preferredFormat, commit) => {
  const { authorDate } = commit
  const newDate = pipe(
    // 2023-11-21 15:58:44 -0800
    d => parseTime(d, 'yyyy-MM-dd HH:mm:ss XX', new Date()),
    timeZone.toLowerCase() === 'utc'
      ? zonedTimeToUtc
      : pipe(zonedTimeToUtc, x => utcToZonedTime(x, timeZone)),
    x => formatDate(x, preferredFormat, { timeZone })
  )(authorDate)
  commit.formattedDate = newDate
  return commit
})
const deriveAuthor = curry((lookup, commit) => {})

const getFiletype = z => {
  const y = z.slice(z.indexOf('.') + 1)
  const dot = y.lastIndexOf('.')
  return dot > -1 ? y.slice(dot + 1) : y
}

const getFiletypes = commit =>
  pipe(
    propOr([], 'files'),
    map(getFiletype),
    uniq,
    z => z.sort(),
    objOf('filetypes'),
    mergeRight(commit)
  )(commit)

export const processData = curry((chalk, config, data) => {
  return pipe(
    config.excludeMergeCommits
      ? reject(pipe(propOr('', 'subject'), startsWith('Merge')))
      : I,
    map(
      pipe(
        adjustRelativeTimezone(config.timezone, config.dateFormat),
        getFiletypes,
        commit =>
          pipe(
            x => [x],
            ap([propOr([], 'status'), propOr([], 'files')]),
            ([a, z]) => zip(a, z),
            groupBy(head),
            objOf('changes'),
            mergeRight(commit),
            z => mergeRight(z, { statuses: uniq(z.status) })
          )(commit)
        // applyPatternsWithChalk(chalk, config.patterns.matches
      )
    )
  )(data)
})

export const printData = curry((chalk, partyFile, config, data) =>
  pipe(
    groupBy(pipe(prop('authorDate'), split(' '), head)),
    map(
      applySpec({
        render: pipe(
          map(commit => {
            const {
              filetypes,
              subject,
              authorName,
              abbrevHash,
              formattedDate,
            } = commit
            const matches = renderPatterns(partyFile.patterns, commit)
            return box(
              {
                subtitleAlign: 'right',
                width: partyFile.longestSubject,
                padding: {
                  left: 1,
                  right: 1,
                  bottom: 0,
                  top: 0,
                },
                subtitle: matches,
                title: `▶ ${chalk.red(
                  authorName
                )} @ ${formattedDate} [${chalk.yellow(abbrevHash)}] ⏹`,
              },
              subject + ' | ' + chalk.blue(filetypes.join(' '))
            )
          }),
          join(`\n\n`)
        ),
        pattern: getAggregatePatterns(chalk, partyFile),
      })
    ),
    toPairs,
    map(([date, { render: v, pattern: patternSummary }]) => {
      const xxx = strlen(date) + strlen(patternSummary)
      return (
        chalk.inverse(
          ' ' +
            date +
            ' ' +
            strepeat(' ')(
              Math.abs(partyFile.longestSubject - xxx) -
                getBorderWidth(config.borderStyle)
            )
        ) +
        patternSummary +
        chalk.inverse('  ') +
        `${NEWBAR} ${NEWBAR} ` +
        v.replace(/\n/g, `${NEWBAR} `) +
        `${NEWBAR} `
      )
    }),
    join('\n'),
    replace(/│ ╭/g, '├─┬')
  )(data)
)

export const processPatterns = curry((chalk, v) =>
  v?.matches
    ? mergeRight(v, {
        fn: Array.isArray(v.color)
          ? pipe(
              map(c => chalk[c]),
              x => raw => pipe.apply(null, x)(raw)
            )(v.color)
          : chalk[v.color],
        matches: v.matches,
      })
    : v
)

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
        chain(loadGitData(cancel, config, chalk))
      )(config)
    }),
    map(({ config, partyFile, gitlog, chalk }) => {
      canon = canonicalize({})
      return pipe(
        propOr({}, 'patterns'),
        map(processPatterns(chalk)),
        patterns =>
          pipe(printLegend(chalk), legend => {
            const longestSubject =
              config.width ||
              partyFile.width ||
              pipe(map(pipe(propOr('', 'subject'), strlen)), z =>
                Math.max(...z)
              )(gitlog)
            return pipe(
              processData(chalk, config),
              printData(
                chalk,
                { ...partyFile, longestSubject, patterns },
                config
              ),
              z => legend + '\n' + z
            )(gitlog)
          })(patterns)
      )(partyFile)
    })
  )(argv)
})
