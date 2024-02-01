import { join as pathJoin, dirname } from 'node:path'
import { signal } from 'kiddo'
import { log } from './log'
import {
  head,
  curry,
  when,
  always as K,
  chain,
  identity as I,
  map,
  pipe,
} from 'ramda'
import { parallel, reject as rejectF, resolve as resolveF } from 'fluture'
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
    `Interpreter is invalid. Incorrect fields: ${incorrectFields.join(', ')}`
)

export const readAndProcessFiles = curry(function _readAndProcessFilesF(
  cancel,
  config,
  { outputDir, relativeArtifact, relative },
  rawF
) {
  try {
    const { interpreter, debug, input, output, artifact = false } = config
    return pipe(
      map(pipe(map(relative), chain(parseFile(debug)))),
      chain(parallel(10)),
      signal(cancel, {
        text: 'Parsing files...',
        successText: 'Parsed files!',
        failText: 'Unable to parse files!',
      }),
      map(processComments(interpreter)),
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
      map(K(''))
    )(rawF)
  } catch (e) {
    rejectF(e)
  }
})

export function getPartialForProcessing(config) {
  const {
    input,
    output,
    artifact = false,
    monorepo: monorepoMode = false,
    cwd,
  } = config

  const rel = relativePathJoin(cwd)
  const outputDir = rel(output)
  const relativeArtifact = artifact ? rel(artifact) : false

  // TODO: we ought to segment the monorepoMode out further
  log.core('relating...', `${cwd} -> ${output}`)
  const localPath = pipe(head, dirname)(input)

  return {
    outputDir,
    relativeArtifact,
    relative: r => (monorepoMode ? pathJoin(localPath, r) : r),
  }
}

export const monorepoPreRunner = curry(
  function _monorepoPreRunner(cancel, config) {
    const { input, output, cwd } = config

    const rel = relativePathJoin(cwd)
    const relativeInput = map(rel, input)

    const pkgJson = relativeInput[0]
    const root = dirname(pkgJson)

    log.core('relating...', `${cwd} -> ${output}`)
    return monorepoRunner(cancel, config, root, pkgJson)
  }
)

export const drgen = curry(function _drgen(cancel, config) {
  // return new Future(function _drgenF(bad, good) {
  try {
    const {
      interpreter = {},
      input,
      monorepo: monorepoMode = false,
      showMatchesOnly = false,
    } = config
    log.core('showMatchesOnly', showMatchesOnly)
    log.core('interpreter!', interpreter)
    if (!validate(interpreter)) {
      pipe(handleInvalidInterpreter, rejectF)(interpreter)
      return cancel
    }
    const partial = getPartialForProcessing(config)
    const rawInput = monorepoMode
      ? monorepoPreRunner(cancel, config)
      : resolveF(input)
    return pipe(
      showMatchesOnly ? I : readAndProcessFiles(cancel, config, partial),
      map(log.core('hey doctor!'))
    )(rawInput)
  } catch (e) {
    rejectF(e)
  }
  // })
})
