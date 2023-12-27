import { configurate } from 'climate'
import { map, pipe } from 'ramda'
import { YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG } from './config'
import { summarize } from './summary'
import { trace } from 'xtrace'
export const cli = args =>
  pipe(
    configurate(YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG, {
      cwd: process.cwd(),
      name: 'digested',
      description: 'summarize a project or a monorepo',
      banner: `💬`,
    }),
    trace('yarrrr'),
    map(summarize)
  )(args)
