import { robotTourist } from './core'

const plugin = {
  name: 'robot-tourist',
  dependencies: [],
  fn: (c, file) => {
    const { file: _f, ...x } = robotTourist({
      file: file.name,
      dropStrings: true,
      dropJSKeywords: true,
      dropTSKeywords: true,
      dropImports: true,
      assumeSimilarWords: true,
    })(file.body)
    return x
  },
}

export default plugin
