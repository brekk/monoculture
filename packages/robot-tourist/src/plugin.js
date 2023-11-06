import { simplifier } from './core'

const plugin = {
  name: 'robot-tourist-simple',
  fn: (c, { file }) =>
    simplifier(
      {
        file,
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
