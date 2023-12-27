import { configurate } from 'climate'
import { pipe } from 'ramda'
import { YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG } from './config'
import { summarize } from './summary'
export const cli = args =>
  pipe(
    configurate(YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG, {
      cwd: process.cwd(),
    }),
    summarize
  )(args)
