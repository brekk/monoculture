import { curry } from 'ramda'
import { recurse } from './recursive'

test('recurse', () => {
  expect(recurse).toBeTruthy()
  const seven = () => `seven`
  expect(
    recurse(
      {
        field: curry((crumbs, x) => typeof x),
        list: curry((crumbs, x) => x),
        pair: curry((crumbs, [k, v]) => (k === 'magic' ? [k, 7] : [k, v])),
      },
      {
        a: {
          b: {
            c: {
              d: {
                e: [1, 2, 3, 4, 5, 'six', seven],
              },
              f: {
                g: {
                  h: 'cool',
                  i: false,
                  j: true,
                },
              },
              k: new Map(),
            },
          },
        },
        l: [{ m: '!' }, { n: '@' }],
        magic: 'this is a number, I promise!',
      }
    )
  ).toEqual({
    a: {
      b: {
        c: {
          d: {
            e: [
              'number',
              'number',
              'number',
              'number',
              'number',
              'string',
              'function',
            ],
          },
          f: { g: { h: 'string', i: 'boolean', j: 'boolean' } },
          k: {},
        },
      },
    },
    l: [{ m: 'string' }, { n: 'string' }],
    magic: 'number',
  })
})
