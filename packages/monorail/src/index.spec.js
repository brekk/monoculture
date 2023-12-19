import { fork, resolve } from 'fluture'
import { reduce, trim, pipe, map } from 'ramda'

import {
  EXPECTED_KEYS,
  noExtraKeys,
  validatePlugins,
  testPlugin,
  checkPlugin,
} from './validate'
import { futureFileProcessor } from './runner'

test('EXPECTED_KEYS', () =>
  expect(EXPECTED_KEYS).toEqual([
    'name',
    'fn',
    'selector',
    'preserveOffset',
    'preserveLine',
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

test.skip('testPlugin - basics', () => {
  const counter = makeCounter()
  const myPlugin = {
    name: 'yo',
    fn: counter,
    squibble: 'zorp',
  }

  const results = testPlugin(myPlugin)
  expect(results).toEqual({
    name: true,
    preserveLine: true,
    preserveOffset: true,
    error: 'Found additional or misspelled keys: [squibble]',
    fn: true,
    store: true,
    dependencies: true,
    selector: true,
  })
})

test.skip('testPlugin - invalid', () => {
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
      preserveLine: 1000,
    },
  ])
  expect(results).toEqual([
    {
      dependencies: true,
      fn: false,
      name: true,
      preserveLine: true,
      preserveOffset: true,
      selector: true,
      store: true,
    },
    {
      dependencies: true,
      fn: false,
      name: false,
      preserveLine: true,
      preserveOffset: true,
      selector: true,
      store: true,
    },
    {
      dependencies: false,
      fn: true,
      name: true,
      preserveLine: true,
      preserveOffset: true,
      selector: false,
      store: true,
    },
    {
      dependencies: true,
      error: 'Found additional or misspelled keys: [depepepependencies]',
      fn: true,
      name: true,
      preserveLine: false,
      preserveOffset: true,
      selector: true,
      store: true,
    },
  ])
})

test.skip('validatePlugins - basics', () => {
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
test.skip('validatePlugins - invalid', () => {
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
test.skip('checkPlugin', () => {
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

const PLUGINS = [
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
    default: {
      name: 't-words',
      dependencies: [],
      preserveLine: true,
      fn: (c, line) => {
        const out = line.split(' ').filter(z => z.startsWith('t')).length
        // eslint-disable-next-line no-console
        // console.log('....', c, line, out)
        return out
      },
    },
  },
]
const FILES = [
  {
    name: '/a/b/c/cool.txt',
    hash: '/a/b/c/cool.txt',
    body: `oh yeah
this is pretty
terribly
great`
      .split('\n')
      .map((x, i) => [i, x]),
  },
  {
    name: '/a/b/c/really-cool.txt',
    hash: '/a/b/c/really-cool.txt',
    body: `hey there,
this is a cool and tricky tool which can process files and answer introspection questions


newlines are also cool
`
      .split('\n')
      .map((x, i) => [i, x]),
  },
]

const EXPECTED_PROCESSING_OUTCOME = {
  events: ['t-words', 'wordcount'],
  hashMap: {
    '/a/b/c/cool.txt': '/a/b/c/cool.txt',
    '/a/b/c/really-cool.txt': '/a/b/c/really-cool.txt',
  },
  state: {
    't-words': [
      [
        '/a/b/c/cool.txt',
        {
          file: '/a/b/c/cool.txt',
          hash: '/a/b/c/cool.txt',
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
          hash: '/a/b/c/really-cool.txt',
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
}

test('futureFileProcessor', done => {
  const ctx = {}
  const outF = futureFileProcessor(ctx, resolve(PLUGINS), resolve(FILES))
  fork(done)(out => {
    expect(out.state).toMatchSnapshot()
    done()
  })(outF)
})
