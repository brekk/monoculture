import { map, prop } from 'ramda'
import { without, topologicalDependencySort } from './sort'

test('without', () => {
  expect(without).toBeTruthy()
  expect(without('bullshit', [{ name: 'bullshit' }, { name: 'zorp' }])).toEqual(
    [{ name: 'zorp' }]
  )
})

const plug = (name, dependencies) => ({ name, dependencies })
test('topologicalDependencySort', () => {
  expect(topologicalDependencySort).toBeTruthy()
  expect(
    map(
      prop('name'),
      topologicalDependencySort([
        plug('h', ['g']),
        plug('g', ['f']),
        plug('c', ['b']),
        plug('b', ['a']),
        plug('d', []),
        plug('e', ['a', 'c', 'd']),
        plug('f', ['a', 'b', 'c', 'd', 'e']),
        plug('a', []),
      ])
    )
  ).toEqual('afedbcgh'.split(''))
})
