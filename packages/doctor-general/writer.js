import { curry, chain, pipe, map, always as K } from 'ramda'
import { writeFileWithAutoPath } from 'file-system'
import { j2 } from 'inherent'

export const writeArtifact = curry(function _writeArtifact(artifactPath, xxx) {
  return chain(content =>
    pipe(
      j2,
      writeFileWithAutoPath(artifactPath),
      // but persist our original content for downstream consumption
      map(K(content))
    )(content)
  )(xxx)
})
