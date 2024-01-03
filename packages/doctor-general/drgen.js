import { join as pathJoin } from 'node:path'
import { cwd } from 'node:process'
import { log } from './log'
import {
  when,
  always as K,
  chain,
  identity as I,
  ifElse,
  map,
  pipe,
} from 'ramda'
import { resolve, parallel } from 'fluture'
import { relativePathJoin } from 'file-system'
import { parseFile } from './parse'
import { renderComments, processComments } from './comment'
import { monorepoRunner } from './reader'
import { writeArtifact } from './writer'

export const drgen = config => {
  const {
    processor,
    debug,
    input,
    output,
    search: searchGlob,
    ignore,
    artifact = false,
    monorepo: monorepoMode = false,
  } = config
  log.core('processor!', processor)
  // TODO: come back to this modality
  // const testMode = mode === 'test'
  log.core('input', input)
  log.core('monorepoMode', monorepoMode)
  // log.core('testMode', testMode)
  const current = cwd()
  const rel = relativePathJoin(current)
  const outputDir = rel(output)
  const relativeArtifact = artifact ? rel(artifact) : false
  const relativeInput = map(rel, input)
  const pkgJson = monorepoMode ? relativeInput[0] : 'NOT RELEVANT'
  log.core('relating...', `${current} -> ${output}`)
  const root = pkgJson.slice(0, pkgJson.lastIndexOf('/'))
  const toLocal = map(ii => ii.slice(0, ii.lastIndexOf('/')), input)
  const relativize = r => (monorepoMode ? pathJoin(toLocal[0], r) : r)
  return pipe(
    log.core(`monorepoMode?`),
    ifElse(
      I,
      () => monorepoRunner(searchGlob, ignore, root, pkgJson),
      () => resolve(input)
    ),
    map(pipe(map(relativize), chain(parseFile(debug, root)))),
    chain(parallel(10)),
    map(processComments(processor)),
    map(log.core('processed comments?')),
    when(K(artifact), writeArtifact(relativeArtifact)),
    renderComments(processor, outputDir),
    map(
      K(
        artifact || output
          ? `Wrote to${output ? ' output: "' + output + '";' : ''}${
              artifact ? ' artifact: "' + artifact + '"' : ''
            }.`
          : `Processed ${input.join(' ')}`
      )
    )
  )(monorepoMode)
}
