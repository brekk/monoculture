import { join as pathJoin } from 'node:path'
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
import { resolve as good, parallel, reject as bad } from 'fluture'
import { relativePathJoin } from 'file-system'
import { parseFile } from './parse'
import { renderComments, processComments } from './comment'
import { monorepoRunner } from './reader'
import { writeArtifact } from './writer'
import { validate, interrogate } from './processor'

const handleInvalidProcessor = pipe(
  interrogate,
  ({ incorrectFields }) =>
    `Processor is invalid. Incorrect fields: ${incorrectFields}`,
  bad
)

export const readAndProcessFiles = curry(function _readAndProcessFiles(
  cancel,
  config,
  { outputDir, relativeArtifact, relative },
  raw
) {
  const { processor, debug, input, output, artifact = false } = config
  return pipe(
    map(pipe(map(relative), chain(parseFile(debug)))),
    chain(parallel(10)),
    signal(cancel, {
      text: 'Parsing files...',
      successText: 'Parsed files!',
      failText: 'Unable to parse files!',
    }),
    map(processComments(bad, processor)),
    when(K(artifact), writeArtifact(relativeArtifact)),
    renderComments(processor, outputDir),
    signal(cancel, {
      text: 'Rendering comments...',
      successText:
        artifact || output
          ? `Wrote to${
              output ? ' output: "' + output + '"' + (artifact ? ';' : '') : ''
            }${artifact ? ' artifact: "' + artifact + '"' : ''}.`
          : `Processed ${input.join(' ')}`,
      failText: 'Unable to render comments!',
    }),
    map(K(''))
  )(raw)
})

export const drgen = curry(function _drgen(cancel, config) {
  const {
    processor,
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
  log.core('processor!', processor)
  if (!validate(processor)) {
    handleInvalidProcessor(processor)
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
  const toLocal = map(ii => ii.slice(0, ii.lastIndexOf('/')), input)
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
      readAndProcessFiles(cancel, config, {
        outputDir,
        relativeArtifact,
        relative: r => (monorepoMode ? pathJoin(toLocal[0], r) : r),
      })
    )
  )(monorepoMode)
})
