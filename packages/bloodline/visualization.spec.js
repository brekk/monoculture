import { fork } from 'fluture'
import {
  dotStreamAdapterWithCancel,
  isNotEmpty,
  setAttribute,
  setColor,
  getCyclic,
  createGraph,
  generateOptions,
  createSVG,
} from './visualization'
import { DEFAULT_GRAPHVIZ_CONFIG } from './constants'
import { plant } from './tree'

test('dotStreamAdapterWithCancel', () => {
  expect(dotStreamAdapterWithCancel).toBeTruthy()
})
test('isNotEmpty', () => {
  expect(isNotEmpty).toBeTruthy()
})
test('setAttribute', () => {
  expect(setAttribute).toBeTruthy()
})
test('setColor', () => {
  expect(setColor).toBeTruthy()
})
test('getCyclic', () => {
  expect(getCyclic).toBeTruthy()
})
test('createGraph', () => {
  expect(createGraph).toBeTruthy()
})
test('generateOptions', () => {
  expect(generateOptions).toBeTruthy()
  expect(generateOptions({})).toMatchSnapshot()
})
test('createSVG', done => {
  expect(createSVG).toBeTruthy()
  // const tree = plant({}, '../..', '../monocle/cli.js')
  // console.log('TREE', tree)
  const modules = { 'a.js': ['b.js', 'c.js'], 'b.js': ['c.js'], 'c.js': [] }
  const cancel = () => {}
  fork(done)(z => {
    expect(z.toString()).toMatchSnapshot()
    done()
  })(createSVG(cancel, DEFAULT_GRAPHVIZ_CONFIG, [], modules))
})
