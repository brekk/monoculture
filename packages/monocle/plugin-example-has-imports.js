import { pathOr } from 'ramda'
const plugin = {
  name: 'has-imports',
  // level: 1,
  dependencies: ['get-imports'],
  fn: (c, file) => {
    return pathOr([], ['state', 'get-imports', file.name], c).length > 0
  },
}

export default plugin
