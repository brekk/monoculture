import {
  always as K,
  mergeRight,
  addIndex,
  curry,
  equals,
  identity as I,
  map,
  pipe,
  propOr,
  reject,
  replace,
  split,
  startsWith,
  trim,
} from 'ramda'
import yargsParser from 'yargs-parser'
import { readFile } from 'fl-utils'
import { fork, resolve } from 'fluture'

import { trace } from './trace'
import { mapSnd, rejectSnd } from './tuple'
import { HELP, CONFIG, DEFAULT_CONFIG } from './config'
import {
  createEntities,
  robotTouristReporter,
  dropJSKeywords,
  dropTSKeywords,
  dropUserDefinedValues,
} from './reporter'
import { replaceNoise } from './source-matcher'
import {
  classify,
  correlate,
  cleanEntities,
  parseWords,
  dropMultilineComments,
  dropImports,
  dropStrings,
  cleanups,
} from './string'

// const { findSimilar } = require('find-similar')

/*
const brainfog = memoizeWith(
  (a, b) => a + b.join('.'),
  (key, ref) => findSimilar(key, ref)
)
*/

export const parser = curry((opts, args) => yargsParser(args, opts))

const robotTourist = ({
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
              // throw away single line comments
              rejectSnd(startsWith('//')),
              // throw away multi line comments
              dropMultilineComments,
              // grab the stack from that process
              propOr([], 'stack'),
              // clean up some stuff we missed
              rejectSnd(equals('*/')),
              // we don't care about the imports, that's all stuff upstream from this file
              dropImports,
              // throw away strings, we don't care about them* - now configurable
              $dropStrings ? dropStrings : I,
              // apply some radical cleanups to text
              mapSnd(pipe(replaceNoise, trim)),
              // if it's JS we don't care
              $dropJS ? dropJSKeywords : I,
              $dropTS ? dropTSKeywords : I,
              // if it's stuff we said we don't care about, we don't care!
              dropUserDefinedValues($ignore),
              // do another round of cleanup, convert to array of words
              mapSnd(
                pipe(trim, replace(/\s\s+/g, ' '), split(' '), reject(cleanups))
              ),
              // no content, throw it away
              reject(([, v]) => v.length === 0),
              // convert to object
              map(([line, content]) => ({
                line,
                content,
                classification: map(classify)(content),
              })),
              // do some secondary logic now that we have classification
              createEntities($file),
              // clean up entities to be more useful
              cleanEntities,
              // produce words in a histogram (and throw away anything which only occurs once)
              ({ entities, ...x }) => ({
                ...x,
                entities,
                words: parseWords({
                  limit: $wordlimit,
                  skip: $skipWords,
                  entities,
                  minimum: $hMin,
                  infer: $similarWords,
                }),
              }),
              ({ words: w, lines: l, ...x }) => {
                const report = correlate($similarWords, w, l)
                return { ...x, lines: l, words: w, report }
              },
              robotTouristReporter($wordlimit, $fun)
            )
          )
        ),
    // eslint-disable-next-line no-console
    fork(console.error)(console.log)
  )($file)

pipe(
  parser(CONFIG),
  z => ({ ...z, file: z._[0] }),
  mergeRight(DEFAULT_CONFIG),
  // trace('CONFIG'),
  robotTourist
)(process.argv.slice(2))
