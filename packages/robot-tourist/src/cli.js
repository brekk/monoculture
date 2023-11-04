import {
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
import { parseAndClassifyWithFile } from './robot-tourist'

// import { mapSnd, rejectSnd } from './tuple'
import { HELP, CONFIG, DEFAULT_CONFIG } from './config'
import { robotTouristReporter } from './reporter'
// import { replaceNoise } from './source-matcher'
import { histograph, correlateSimilar } from './stats'

export const parser = curry((opts, args) => yargsParser(args, opts))

const cli = ({
  help: $help,
  fun: $fun,
  file: $file,
  limit: $wordlimit,
  ignore: $ignore,
  skipWords: $skipWords,
  dropStrings: $dropStrings,
  histogramMinimum: $hMin,
  assumeSimilarWords: $similarWords,
  dropJSKeywords: $dropJS,
  dropTSKeywords: $dropTS,
  dropImports: $dropImports,
}) =>
  pipe(
    $help
      ? K(resolve(HELP))
      : pipe(
          readFile,
          map(
            pipe(
              split('\n'),
              // add line numbers
              addIndex(map)((x, i) => [i + 1, trim(x)]),
              parseAndClassifyWithFile($file, {
                ignore: $ignore,
                dropImports: $dropImports,
                dropStrings: $dropStrings,
                dropJS: $dropJS,
                dropTS: $dropTS,
              }),
              histograph({
                wordlimit: $wordlimit,
                skip: $skipWords,
                minimum: $hMin,
                infer: $similarWords,
              }),
              correlateSimilar($similarWords),
              robotTouristReporter($wordlimit, $fun)
            )
          )
        ),
    // eslint-disable-next-line no-console
    fork(console.error)(console.log)
  )($file)

pipe(
  parser(CONFIG),
  // TODO: use `configurate` here
  z => ({ ...z, file: z._[0] }),
  mergeRight(DEFAULT_CONFIG),
  // trace('CONFIG'),
  cli
)(process.argv.slice(2))
