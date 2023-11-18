import PKG from '../package.json'
import { configurate } from 'configurate'
import { trace } from 'xtrace'
import { chain, addIndex, curry, map, pipe, split, trim } from 'ramda'
import yargsParser from 'yargs-parser'
import { readFile } from 'file-system'
import { fork } from 'fluture'

// import { mapSnd, rejectSnd } from './tuple'
import { DYNAMIC_BANNER, CONFIG, DEFAULT_CONFIG, HELP_CONFIG } from './config'
import { robotTouristReporter } from './reporter'
import { robotTourist } from './core'
// import { replaceNoise } from './source-matcher'

export const parser = curry((opts, args) => yargsParser(args, opts))

const cli = ({ fun: $fun, _: [$file], limit: $wordlimit, ...$config }) =>
  pipe(
    // TODO: this will be replaced by the behavior of `monocle` eventually
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

const { name: $NAME, description: $DESC } = PKG
pipe(
  configurate(CONFIG, DEFAULT_CONFIG, HELP_CONFIG, {
    name: $NAME,
    description: $DESC,
    banner: DYNAMIC_BANNER,
  }),
  map(trace('config')),
  chain(cli),
  // eslint-disable-next-line no-console
  fork(console.error)(console.log)
)(process.argv.slice(2))
