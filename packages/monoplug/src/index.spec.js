import path from 'node:path'

import { fork, parallel } from 'fluture'
import {
  chain,
  pipe,
  prop,
  objOf,
  identity as I,
  split,
  addIndex,
  map,
} from 'ramda'

import { readDir, readFile } from 'file-system'

import { validatePlugins, testPlugin, checkPlugin } from './validate'
import { taskProcessor } from './runner'

const makeCounter = () => {
  let count = 0
  return () => {
    count += 1
    return count
  }
}

test('testPlugin - basics', () => {
  const counter = makeCounter()
  const myPlugin = {
    name: 'yo',
    fn: counter,
  }

  const results = testPlugin(myPlugin)
  expect(results).toEqual({
    name: true,
    fn: true,
    store: true,
    dependencies: true,
    selector: true,
  })
})

test('testPlugin - invalid', () => {
  const results = map(testPlugin)([
    {
      name: 'yo',
      fn: 'hey now',
    },
    // nothing set
    {},
    // defaults are wrong kind
    { dependencies: 1, selector: [], name: 'yo', fn: () => {} },
  ])
  expect(results).toEqual([
    {
      name: true,
      fn: false,
      dependencies: true,
      selector: true,
      store: true,
    },
    { name: false, fn: false, dependencies: true, selector: true, store: true },
    { name: true, selector: false, dependencies: false, fn: true, store: true },
  ])
})

test('validatePlugins - basics', () => {
  const counter = makeCounter()
  const myPlugin = {
    name: 'yo',
    fn: counter,
  }

  const results = validatePlugins([myPlugin])
  expect(results).toEqual({
    correct: ['yo'],
  })
})
test('validatePlugins - invalid', () => {
  const results = validatePlugins([
    { name: 'oh-cool', fn: () => {} },
    { name: 'nice', fn: () => {} },
    {
      name: 'yo',
      fn: 'hey now',
    },
    // nothing set
    {},
    // defaults are wrong kind
    { dependencies: 1, selector: [], name: 'incorrecto', fn: () => {} },
  ])
  expect(results).toEqual({
    correct: ['oh-cool', 'nice'],
    incorrect: [
      ['yo', ['fn']],
      ['unnamed', ['name', 'fn']],
      ['incorrecto', ['selector', 'dependencies']],
    ],
  })
})
test('checkPlugin', () => {
  const count = makeCounter()
  const results = map(checkPlugin)([
    { name: 'cool', fn: count },
    { name: 'really cool', fn: count, dependencies: ['cool'] },
    {
      name: 'yo',
      fn: 'hey now',
    },
    {},
    { dependencies: 1, selector: [], name: 'yo', fn: () => {} },
  ])
  expect(results).toEqual([true, true, false, false, false])
})

test('taskProcessor', () => {
  const ctx = { value: 97 }
  const selector = y => y.value
  const plugins = [
    { name: 'e', dependencies: ['b', 'd'], fn: c => c.d * 5 },
    { name: 'd', dependencies: ['b', 'c'], fn: c => c / 4, selector },
    { name: 'a', dependencies: [], fn: c => c, selector },
    { name: 'a1', dependencies: ['a'], fn: c => c * 1.1, selector },
    { name: 'a2', dependencies: ['a', 'b'], fn: c => c / 2.2, selector },
    { name: 'a3', dependencies: ['a'], fn: c => c * 3.3, selector },
    { name: 'a4', dependencies: ['a', 'a3'], fn: c => c.value / 4.4 },
    { name: 'c', dependencies: ['b'], fn: c => c * 3, selector },
    { name: 'b', dependencies: ['a'], fn: c => c / 2, selector },
  ]
  const out = taskProcessor(ctx, plugins)
  expect(out.state).toEqual({
    a: 97,
    a1: 106.7,
    a2: 44.090909090909086,
    a3: 320.09999999999997,
    a4: 22.045454545454543,
    b: 48.5,
    c: 291,
    d: 24.25,
    e: 121.25,
    value: 97,
  })
})

test('taskProcessor - with store config', () => {
  const ctx = { value: 97 }
  const store = v => ({ value: v.value })
  const selector = y => y.value
  const plugins = [
    { name: 'a', dependencies: [], fn: c => c, selector, store },
    { name: 'b', dependencies: ['a'], fn: c => c * 7, selector, store },
    { name: 'a3', dependencies: ['a'], fn: c => c * 11, selector, store },
    { name: 'a4', dependencies: ['a', 'a3'], fn: c => c * 13, selector, store },
    { name: 'a1', dependencies: ['a'], fn: c => c * 17, selector, store },
    { name: 'c', dependencies: ['b'], fn: c => c * 19, selector, store },
    { name: 'a2', dependencies: ['a', 'b'], fn: c => c * 23, selector, store },
    { name: 'd', dependencies: ['b', 'c'], fn: c => c * 29, selector, store },
    { name: 'e', dependencies: ['b', 'd'], fn: c => c * 31, selector, store },
  ]
  const out2 = taskProcessor(ctx, [
    ...plugins,
    {
      name: 'omega',
      dependencies: ['e'],
      // selector: prop('e'),
      fn: x => x * 37,
      selector,
      store: x => x.omega,
    },
  ])
  expect(out2.events).toEqual([
    ['a', 97],
    ['a1', 1649],
    ['a3', 1067],
    ['a4', 1261],
    ['b', 679],
    ['a2', 2231],
    ['c', 1843],
    ['d', 2813],
    ['e', 3007],
    ['omega', 3589],
  ])
  expect(out2.state).toEqual(3589)
})
