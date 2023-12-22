import { pipe, map } from 'ramda'
import { parseAllDocuments, parse } from 'yaml'

export const plugin = {
  name: 'yaml',
  test: pipe(parse, raw => raw && typeof raw === 'object'),
  parse,
}
export default plugin

export const many = {
  name: 'yaml-many',
  test: pipe(parseAllDocuments, raw => raw && typeof raw === 'object'),
  parse: pipe(
    parseAllDocuments,
    map(zz => zz.toJS())
  ),
}
