import { curry, reject, propEq } from 'ramda'
import { Sorter } from '@hapi/topo'
import { log } from './trace'

export const withoutProp = curry((prop, value, x) =>
  reject(propEq(value, prop), x)
)

// javavascurpies
const handleDefault = rawPlug => {
  console.log('IN', rawPlug)
  // TODO: this must be an upstream bug
  const out = rawPlug?.default?.default
    ? rawPlug.default.default
    : rawPlug?.default
    ? rawPlug.default
    : rawPlug
  console.log('OUT', out)
  return out
}

export const toposort = raw => {
  const list = raw.slice().map(handleDefault)
  log.sort('sorting...', list)
  const t = new Sorter()
  list.forEach(({ group, name, dependencies: after }) => {
    t.add(name, {
      after,
      manual: true,
      group: group || name,
    })
  })
  t.sort()
  return log
    .sort('sorted!', t.nodes)
    .map(sortName => list.find(z => z.name === sortName))
}
