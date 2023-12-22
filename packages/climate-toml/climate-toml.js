import { pipe } from 'ramda'
import { parse } from 'smol-toml'

const plugin = {
  name: 'toml',
  test: pipe(parse, z => typeof z !== 'undefined'),
  parse,
}
export default plugin
