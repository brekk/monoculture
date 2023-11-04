import { configurate } from 'configurate'
import {
  chain,
  always as K,
  mergeRight,
  addIndex,
  curry,
  map,
  pipe,
  split,
  trim,
} from 'ramda'
import yargsParser from 'yargs-parser'
import { readFile } from 'file-system'
import { fork, resolve } from 'fluture'

// import { mapSnd, rejectSnd } from './tuple'
import { CONFIG, DEFAULT_CONFIG, HELP_CONFIG } from './config'
import { robotTouristReporter } from './reporter'
import { robotTourist } from './robot-tourist'
// import { replaceNoise } from './source-matcher'

export const parser = curry((opts, args) => yargsParser(args, opts))

const cli = ({ fun: $fun, _: [$file], limit: $wordlimit, ...$config }) =>
  pipe(
    readFile,
    map(
      pipe(
        split('\n'),
        // add line numbers
        addIndex(map)((x, i) => [i + 1, trim(x)]),
        robotTourist({ ...$config, file: $file }),
        robotTouristReporter($wordlimit, $fun)
      )
    )
  )($file)

pipe(
  configurate(CONFIG, DEFAULT_CONFIG, HELP_CONFIG, 'robot-tourist'),
  chain(cli),
  // eslint-disable-next-line no-console
  fork(console.error)(console.log)
)(process.argv.slice(2))
