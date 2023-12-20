import { startsWith, propOr, pathOr } from 'ramda'
const plugin = {
  name: 'has-exports',
  selector: pathOr({}, ['state', 'get-exports']),
  fn: (selected, file, { any }) => any(/^export/),
}

export default plugin
