import { robotTourist } from './core'
const NAME = 'robot-tourist'

const plugin = {
  name: NAME,
  dependencies: [],
  fn: (state, file, { config }) => {
    const { file: _f, ...x } = robotTourist({
      dropStrings: true,
      dropJSKeywords: true,
      dropTSKeywords: true,
      dropImports: true,
      assumeSimilarWords: true,
      ...config,
      file: file.name,
    })(file.body)
    return x
  },
}

export default plugin
