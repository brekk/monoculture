import { simplifier } from './core'
import { histograph } from './stats'
import { pipe } from 'ramda'

const plugin = {
  name: 'robot-tourist-simplifier',
  dependencies: [],
  fn: (c, file, { config }) => {
    const updatedConfig = {
      file: file.name,
      ignore: [],
      dropStrings: true,
      dropJSKeywords: true,
      dropTSKeywords: true,
      dropImports: true,
      ...config,
    }
    return pipe(simplifier(updatedConfig), histograph(updatedConfig))(file.body)
  },
}

export default plugin
