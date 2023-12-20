import { propOr, pathOr } from 'ramda'
const plugin = {
  name: 'has-imports',
  dependencies: ['get-imports'],
  selector: pathOr({}, ['state', 'get-imports']),
  fn: (selected, file) => propOr([], file.name, selected).length > 0,
}

export default plugin
