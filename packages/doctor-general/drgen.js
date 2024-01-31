import { join as pathJoin, dirname } from 'node:path'
import { signal } from 'kiddo'
import { log } from './log'
import {
  curry,
  unless,
  when,
  always as K,
  chain,
  identity as I,
  ifElse,
  map,
  pipe,
} from 'ramda'
import { parallel, Future } from 'fluture'
import { relativePathJoin } from 'file-system'
import { parseFile } from './parse'
import { renderComments, processComments } from './comment'
import { monorepoRunner } from './reader'
import { writeArtifact } from './writer'
import { validate, interrogate } from './interpreter'
export {
  validate as validateInterpreter,
  interrogate as checkInterpreter,
} from './interpreter'

const handleInvalidInterpreter = pipe(
  interrogate,
  ({ incorrectFields }) =>
    `Interpreter is invalid. Incorrect fields: ${incorrectFields}`
)

export const readAndProcessFiles = curry(function _readAndProcessFiles(
  cancel,
  config,
  { outputDir, relativeArtifact, relative },
  raw
) {
  return new Future((bad, good) => {
    const { interpreter, debug, input, output, artifact = false } = config
    return pipe(
      map(pipe(map(relative), chain(parseFile(debug)))),
      chain(parallel(10)),
      signal(cancel, {
        text: 'Parsing files...',
        successText: 'Parsed files!',
        failText: 'Unable to parse files!',
      }),
      map(processComments(bad, interpreter)),
      when(K(artifact), writeArtifact(relativeArtifact)),
      renderComments(interpreter, outputDir),
      signal(cancel, {
        text: 'Rendering comments...',
        successText:
          artifact || output
            ? `Wrote to${
                output
                  ? ' output: "' + output + '"' + (artifact ? ';' : '')
                  : ''
              }${artifact ? ' artifact: "' + artifact + '"' : ''}.`
            : `Processed ${input.join(' ')}`,
        failText: 'Unable to render comments!',
      }),
      map(K('')),
      good
    )(raw)
    return cancel
  })
})

export const drgen = curry(function _drgen(cancel, config) {
  return new Future(function _drgenF(bad, good) {
    const {
      interpreter,
      input,
      output,
      search: searchGlob,
      ignore,
      artifact = false,
      monorepo: monorepoMode = false,
      showMatchesOnly = false,
      cwd,
    } = config
    log.core('showMatchesOnly', showMatchesOnly)
    log.core('interpreter!', interpreter)
    if (!validate(interpreter)) {
      pipe(handleInvalidInterpreter, bad)(interpreter)
      return cancel
    }
    log.core('input', input)
    log.core('monorepoMode', monorepoMode)
    const rel = relativePathJoin(cwd)
    const outputDir = rel(output)
    const relativeArtifact = artifact ? rel(artifact) : false
    const relativeInput = map(rel, input)

    // TODO: we ought to segment the monorepoMode out further
    const pkgJson = monorepoMode ? relativeInput[0] : 'NOT RELEVANT'
    log.core('relating...', `${cwd} -> ${output}`)
    const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
    const toLocal = map(dirname, input)
    console.log('root', root, 'HUH?', toLocal, 'input', input)
    return pipe(
      log.core(`monorepoMode?`),
      ifElse(
        I,
        () =>
          monorepoRunner(
            cancel,
            { showMatchesOnly, searchGlob, ignore },
            root,
            pkgJson
          ),
        () => good(input)
      ),
      unless(
        () => showMatchesOnly,
        chain(
          readAndProcessFiles(cancel, config, {
            outputDir,
            relativeArtifact,
            relative: r => (monorepoMode ? pathJoin(toLocal[0], r) : r),
          })
        )
      )
    )(monorepoMode)
    return cancel
  })
})
