import {
  pipe,
  map,
  trim,
  filter,
  identity as I,
  all,
  anyPass,
  startsWith,
  test,
  split,
} from 'ramda'
import { parse } from 'smol-toml'

const plugin = {
  name: 'toml',
  test: pipe(
    split('\n'),
    map(trim),
    filter(I),
    all(anyPass([startsWith('#'), startsWith('['), test('(.*) = (.*)')]))
  ),
  parse,
}
export default plugin
