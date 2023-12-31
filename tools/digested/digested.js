import { cwd } from 'node:process'
import { configurate } from 'climate'
import { chain, pipe } from 'ramda'
import { YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG } from './config'
import { summarize } from './summary'
export const cli = args =>
  pipe(
    configurate(YARGS_CONFIG, { ...CONFIG_DEFAULTS, cwd: cwd() }, HELP_CONFIG, {
      cwd: cwd(),
      name: 'digested',
      description: 'summarize a project or a monorepo',
      banner: `💬`,
    }),
    chain(summarize)
  )(args)
