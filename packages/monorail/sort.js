import { tap, pipe, map, prop, curry, reject, propEq } from 'ramda'
import { Sorter } from '@hapi/topo'
import { log } from './trace'

export const withoutProp = curry((property, value, x) =>
  reject(propEq(value, property), x)
)

// javavascurpies
const handleDefault = rawPlug => {
  // TODO: this must be an upstream bug
  const out = rawPlug?.default?.default
    ? rawPlug.default.default
    : rawPlug?.default
      ? rawPlug.default
      : rawPlug
  return out
}

export const toposort = raw => {
  const list = raw.slice().map(handleDefault)
  tap(pipe(map(prop('name')), log.sort('sorting...'))(list))
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
