import path from 'node:path'

import { fork, parallel } from 'fluture'
import {
  reduce,
  trim,
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

import {
  EXPECTED_KEYS,
  noExtraKeys,
  validatePlugins,
  testPlugin,
  checkPlugin,
} from './validate'
import { taskProcessor, fileProcessor } from './runner'

test('EXPECTED_KEYS', () =>
  expect(EXPECTED_KEYS).toEqual([
    'name',
    'fn',
    'selector',
    'processLine',
    'store',
    'dependencies',
  ]))

test('noExtraKeys', () => {
  const outcome = noExtraKeys({ a: 'a', b: 'b', c: 'c' })
  expect(outcome).toEqual(`Found additional or misspelled keys: [a, b, c]`)
})

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
    squibble: 'zorp',
  }

  const results = testPlugin(myPlugin)
  expect(results).toEqual({
    name: true,
    processLine: true,
    error: 'Found additional or misspelled keys: [squibble]',
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
    { dependencies: 1, selector: [], name: 'again', fn: () => {} },
    // misspelled keys
    {
      depepepependencies: [],
      name: 'incorrectkeys',
      fn: () => {},
      processLine: 1000,
    },
  ])
  expect(results).toEqual([
    {
      dependencies: true,
      fn: false,
      name: true,
      processLine: true,
      selector: true,
      store: true,
    },
    {
      dependencies: true,
      fn: false,
      name: false,
      processLine: true,
      selector: true,
      store: true,
    },
    {
      dependencies: false,
      fn: true,
      name: true,
      processLine: true,
      selector: false,
      store: true,
    },
    {
      dependencies: true,
      error: 'Found additional or misspelled keys: [depepepependencies]',
      fn: true,
      name: true,
      processLine: false,
      selector: true,
      store: true,
    },
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

test('fileProcessor', () => {
  const ctx = {}
  const plugins = [
    {
      name: 'wordcount',
      dependencies: [],
      fn: (c, f) =>
        pipe(
          map(([, lineContent]) => lineContent.split(' ').map(trim).length),
          reduce((a, b) => a + b, 0)
        )(f.body),
    },
    {
      name: 't-words',
      dependencies: [],
      processLine: true,
      fn: (c, line) => line.split(' ').filter(z => z.startsWith('t')).length,
    },
  ]
  const out2 = fileProcessor(
    ctx,
    [...plugins],
    [
      {
        file: '/a/b/c/cool.txt',
        body: `oh yeah
this is pretty
terribly
great`
          .split('\n')
          .map((x, i) => [i, x]),
      },
      {
        file: '/a/b/c/really-cool.txt',
        body: `hey there,
this is a cool and tricky tool which can process files and answer introspection questions


newlines are also cool
`
          .split('\n')
          .map((x, i) => [i, x]),
      },
    ]
  )
  expect(out2).toEqual({
    events: ['t-words', 'wordcount'],
    state: {
      't-words': [
        [
          '/a/b/c/cool.txt',
          {
            file: '/a/b/c/cool.txt',
            body: [
              [0, 0],
              [1, 1],
              [2, 1],
              [3, 0],
            ],
          },
        ],
        [
          '/a/b/c/really-cool.txt',
          {
            file: '/a/b/c/really-cool.txt',
            body: [
              [0, 1],
              [1, 3],
              [2, 0],
              [3, 0],
              [4, 0],
              [5, 0],
            ],
          },
        ],
      ],
      wordcount: [
        ['/a/b/c/cool.txt', 7],
        ['/a/b/c/really-cool.txt', 24],
      ],
    },
  })
})
