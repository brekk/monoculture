import { map, curry, indexOf } from 'ramda'
import { Sorter } from '@hapi/topo'
import { withoutProp, toposort } from './sort'

test('withoutProp', () => {
  expect(withoutProp).toBeTruthy()
  const without = withoutProp('name')
  expect(without('bullshit', [{ name: 'bullshit' }, { name: 'zorp' }])).toEqual(
    [{ name: 'zorp' }]
  )
})

const plug = (name, dependencies) => ({ name, dependencies })

const topotest = raw => {
  const list = raw.slice()
  const t = new Sorter()
  list.forEach(y => {
    t.add(y.name, { after: y.dependencies, manual: true, group: y.name })
  })
  t.sort()
  return t.nodes.map(y => list.find(z => z.name === y))
}

const before = curry((a, z, x) => {
  const [_a, _z] = map(indexOf)([a, z])
  const __a = _a(x)
  const __z = _z(x)
  return __a < __z
})

test('topo smoke test', () => {
  const sorted = topotest([
    plug('j-words', ['a-words']),
    plug('get-imports', ['wordcount']),
    plug('z-words', ['a-words', 'j-words']),
    plug('has-imports', ['get-imports']),
    plug('wordcount', []),
    plug('a-words', ['wordcount']),
  ]).map(z => z.name)
  expect(before('j-words', 'z-words', sorted)).toBeTruthy()
  expect(before('a-words', 'z-words', sorted)).toBeTruthy()
  expect(before('wordcount', 'get-imports', sorted)).toBeTruthy()
  expect(before('get-imports', 'has-imports', sorted)).toBeTruthy()
  expect(sorted).toEqual([
    'wordcount',
    'get-imports',
    'has-imports',
    'a-words',
    'j-words',
    'z-words',
  ])
})
test('toposort - plugins', () => {
  expect(toposort).toBeTruthy()

  const sorted = toposort([
    plug('j-words', ['a-words']),
    plug('get-imports', ['wordcount']),
    plug('z-words', ['a-words', 'j-words']),
    plug('has-imports', ['get-imports']),
    plug('wordcount', []),
    plug('a-words', ['wordcount']),
  ]).map(z => z.name)
  expect(before('j-words', 'z-words', sorted)).toBeTruthy()
  expect(before('a-words', 'z-words', sorted)).toBeTruthy()
  expect(before('wordcount', 'get-imports', sorted)).toBeTruthy()
  expect(before('get-imports', 'has-imports', sorted)).toBeTruthy()
  expect(sorted).toEqual([
    'wordcount',
    'get-imports',
    'has-imports',
    'a-words',
    'j-words',
    'z-words',
  ])
})
