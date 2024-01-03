export * from './comment-test'
export * from './renderer-jest'

const renderFileForJest = renderFileWith({
  renderer: (_, raw) => commentToJestTest(raw),
  postRender: ({ file, imports }, raw) => [
    '// This test automatically generated by doctor-general.',
    `// Sourced from '${file.filename}', edits to this file may be erased.`,
    `import {
  ${imports.join(',\n  ')}
} from '../${file.slugName}'\n`,
    ...raw,
  ],
})
