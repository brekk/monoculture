import { pipe } from 'ramda'

export const plugin = {
  name: 'json',
  test: pipe(JSON.parse, raw => raw && typeof raw === 'object'),
  parse: JSON.parse,
}
export default plugin
