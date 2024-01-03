import { curry } from 'ramda'
import { filterAndStructureTests } from './comment-test'
import { commentToJestTest } from './renderer-jest'

export default {
  output: () => '',
  group: 'testPath',
  process: filterAndStructureTests,
  renderer: curry((_, raw) => commentToJestTest(raw)),
  postRender: curry(({ file, imports }, raw) =>
    [
      '// This test automatically generated by doctor-general.',
      `// Sourced from '${file.filename}', edits to this file may be erased.`,
      `import {
  ${imports.join(',\n  ')}
} from '../${file.slugName}'\n`,
      ...raw,
    ].join('\n')
  ),
}