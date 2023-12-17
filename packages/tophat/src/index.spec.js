import { forEach } from 'ramda'
import { makeSortable, makeSortable2, tophat } from './index'

const makeAndAdd = (maker, shit) => {
  const sortable = maker()
  forEach(({ id, ...x }) => sortable.add(id, x), shit)
  return sortable.sort().join('')
}

test('sorts dependencies (old)', () => {
  const input = [
    { id: '0', before: 'a' },
    { id: '1', after: 'f', group: 'a' },
    { id: '2', before: 'a' },
    { id: '3', before: ['b', 'c'], group: 'a' },
    { id: '4', after: 'c', group: 'b' },
    { id: '5', group: 'c' },
    { id: '6', group: 'd' },
    { id: '7', group: 'e' },
    { id: '8', before: 'd' },
    { id: '9', after: 'c', group: 'a' },
  ]

  expect(makeAndAdd(makeSortable, input)).toEqual('0213547869')
})

test('sorts dependencies (new)', () => {
  const input = [
    { id: '0', before: 'a' },
    { id: '1', after: 'f', group: 'a' },
    { id: '2', before: 'a' },
    { id: '3', before: ['b', 'c'], group: 'a' },
    { id: '4', after: 'c', group: 'b' },
    { id: '5', group: 'c' },
    { id: '6', group: 'd' },
    { id: '7', group: 'e' },
    { id: '8', before: 'd' },
    { id: '9', after: 'c', group: 'a' },
  ]

  expect(makeAndAdd(makeSortable2, input)).toEqual('0213547869')
})
