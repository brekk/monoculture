import { robotTourist } from './core'

const plugin = {
  name: 'robot-tourist',
  dependencies: [],
  fn: (c, file) =>
    robotTourist(
      {
        file: file.file,
        dropStrings: true,
        dropJSKeywords: true,
        dropTSKeywords: true,
        dropImports: true,
        assumeSimilarWords: true,
      },
      file.body
    ),
}

export default plugin
