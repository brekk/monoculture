import { pathOr } from 'ramda'
const plugin = {
  name: 'has-imports',
  dependencies: ['get-imports'],
  level: 1,
  fn: (c, file) =>
    pathOr([], ['state', 'get-imports', file.hash], c).length > 0,
}

export default plugin
