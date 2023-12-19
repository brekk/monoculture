import { curry, reject, propEq } from 'ramda'
import { Sorter } from '@hapi/topo'
import { log } from './trace'

export const withoutProp = curry((prop, value, x) =>
  reject(propEq(value, prop), x)
)

// javavascurpies
const handleDefault = rawPlug => rawPlug?.default ?? rawPlug

export const toposort = raw => {
  const list = raw.slice().map(handleDefault)
  log.sort(
    'unsorted',
    list.map(z => z.name)
  )
  const t = new Sorter()
  list.forEach(y => {
    t.add(y.name, {
      after: y.dependencies,
      manual: true,
      group: y.level ? y.level : y.name,
    })
  })
  t.sort()
  return log
    .sort('sorted!', t.nodes)
    .map(sortName => list.find(z => z.name === sortName))
}
