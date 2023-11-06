import { robotTourist } from './core'

const plugin = {
  name: 'robot-tourist',
  fn: (c, { file }) =>
    robotTourist(
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
