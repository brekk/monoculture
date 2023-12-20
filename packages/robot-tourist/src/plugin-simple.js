import { simplifier } from './core'

const plugin = {
  name: 'robot-tourist-simple',
  dependencies: [],
  fn: (c, file) =>
    simplifier(
      {
        file: file.name,
        ignore: [],
        dropStrings: true,
        dropJSKeywords: true,
        dropTSKeywords: true,
        dropImports: true,
      },
      file.body
    ),
}

export default plugin
