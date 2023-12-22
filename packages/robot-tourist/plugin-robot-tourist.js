import { correlateSimilar } from './stats'

const plugin = {
  name: 'robot-tourist',
  dependencies: ['robot-tourist-simplifier'],
  selector: y => y?.state?.['robot-tourist-simplifier'],
  fn: (state, file, { config }) => {
    const { [file.name]: lookup } = state
    return correlateSimilar(config?.assumeSimilarWords ?? true, lookup)
  },
}

export default plugin
