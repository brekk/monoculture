import { join as pathJoin } from 'node:path'
import { cwd } from 'node:process'
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

export const handleMatches = curry(function _handleMatches(
  cancel,
  config,
  { outputDir, relativeArtifact, relative, root },
  raw
) {
  const { processor, debug, input, output, artifact = false } = config
  return pipe(
    map(pipe(map(relative), chain(parseFile(debug, root)))),
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
  } = config
  log.core('showMatchesOnly', showMatchesOnly)
  log.core('processor!', processor)
  if (!validate(processor)) {
    handleInvalidProcessor(processor)
  }
  log.core('input', input)
  log.core('monorepoMode', monorepoMode)
  const current = cwd()
  const rel = relativePathJoin(current)
  const outputDir = rel(output)
  const relativeArtifact = artifact ? rel(artifact) : false
  const relativeInput = map(rel, input)
  const pkgJson = monorepoMode ? relativeInput[0] : 'NOT RELEVANT'
  log.core('relating...', `${current} -> ${output}`)
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = map(ii => ii.slice(0, ii.lastIndexOf('/')), input)
  const relative = r => (monorepoMode ? pathJoin(toLocal[0], r) : r)
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
      handleMatches(cancel, config, {
        outputDir,
        relativeArtifact,
        relative,
        root,
      })
    )
  )(monorepoMode)
})
