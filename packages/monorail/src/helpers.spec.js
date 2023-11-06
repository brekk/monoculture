import { makeHelpers } from './helpers'

const FILE = {
  body: `import {
  __ as $,
  any,
  ap,
  curry,
  defaultTo,
  filter,
  find,
  findLast,
  head,
  last,
  length,
  lt,
  map,
  pipe,
  propOr,
  reduce,
  slice,
  test,
} from 'ramda'
import { trace } from 'xtrace'

export const getBody = propOr([], 'body')

export const bodyTest = curry((fn, file, needle) =>
  pipe(getBody, fn(pipe(last, test(needle))))(file)
)
export const _reduce = curry((file, fn, initial) =>
  pipe(getBody, reduce(fn, initial))(file)
)
`
    .split('\n')
    .map((v, k) => [k + 1, v]),
}
describe('makeHelpers', () => {
  const helpers = makeHelpers(FILE)
  it('any', () => {
    const some = helpers.any(/^import/)
    expect(some).toMatchSnapshot()
  })
  it('lines', () => {
    const lines = helpers.onLines(/^import/)
    expect(lines).toMatchSnapshot()
  })
  it('line', () => {
    const line = helpers.onLine(/ramda/)
    expect(line).toMatchSnapshot()
  })
  it('filter', () => {
    const filter = helpers.filter(/export/g)
    expect(filter).toMatchSnapshot()
  })
  it('between', () => {
    const between = helpers.between(/^import/, /from (.*)$/)
    expect(between).toMatchSnapshot()
    const twixtNothing = helpers.between(/aaa/, /bbb/)
    expect(twixtNothing).toMatchSnapshot()
  })
  it('selectAll', () => {
    const selectAll = helpers.selectAll(/^import/, /from (.*)$/)
    expect(selectAll).toMatchSnapshot()
  })
  it('reduce', () => {
    const reduce = helpers.reduce((agg, [, content]) => agg.concat(content), [])
    expect(reduce).toMatchSnapshot()
  })
})
