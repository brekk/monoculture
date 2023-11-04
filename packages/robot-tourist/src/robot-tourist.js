import {
  mergeRight,
  curry,
  equals,
  identity as I,
  map,
  pipe,
  reject,
  replace,
  split,
  startsWith,
  trim,
} from 'ramda'
import yargsParser from 'yargs-parser'

import { mapSnd, rejectSnd } from './tuple'
import {
  createEntitiesFromRaw,
  dropJSKeywords,
  dropTSKeywords,
  dropUserDefinedValues,
} from './reporter'
import { replaceNoise } from './source-matcher'
import {
  classify,
  cleanEntities,
  dropMultilineComments,
  dropImports,
  dropStrings,
  cleanups,
} from './string'

export const parser = curry((opts, args) => yargsParser(args, opts))

export const classifyEntities = pipe(
  // convert to object
  map(([line, content]) => ({
    line,
    content,
    classification: map(classify)(content),
  })),
  // do some secondary logic now that we have classification
  createEntitiesFromRaw,
  // clean up entities to be more useful
  cleanEntities
)

export const parse = curry(
  (
    {
      ignore: $ignore,
      dropImports: $dropImports,
      dropStrings: $dropStrings,
      dropJS: $dropJS,
      dropTS: $dropTS,
    },
    input
  ) =>
    pipe(
      // throw away single line comments
      rejectSnd(startsWith('//')),
      // throw away multi line comments
      dropMultilineComments,
      // we don't care about the imports, that's all stuff upstream from this file
      $dropImports ? dropImports : I,
      // throw away strings, we don't care about them* - now configurable
      $dropStrings ? dropStrings : I,
      // apply some radical cleanups to text
      mapSnd(pipe(replaceNoise, trim)),
      // if it's JS we don't care
      $dropJS ? dropJSKeywords : I,
      // if it's TS we don't care
      $dropTS ? dropTSKeywords : I,
      // if it's stuff we said we don't care about, we don't care!
      dropUserDefinedValues($ignore),
      // do another round of cleanup, convert to array of words
      mapSnd(pipe(trim, replace(/\s\s+/g, ' '), split(' '), reject(cleanups))),
      // no content, u bi rata
      reject(([, v]) => v.length === 0)
    )(input)
)

export const parseAndClassify = curry((conf, x) =>
  pipe(parse(conf), classifyEntities)(x)
)

export const parseAndClassifyWithFile = curry((file, conf, x) =>
  pipe(parseAndClassify(conf), mergeRight({ file }))(x)
)
