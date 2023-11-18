import stripAnsi from 'strip-ansi'
import {
  getWords,
  summarize,
  robotTouristReporter,
  dropJSKeywords,
  dropTSKeywords,
  dropUserDefinedValues,
  createEntitiesFromRaw,
  createEntities,
} from './reporter'
import { BW_LOGO } from './config'

const RAW_IN = {
  similar: [1, 101, 121, 123],
  with: [13],
}

const IN = [
  {
    line: 1,
    content: ['histograph', 'correlateSimilar'],
    classification: ['text', 'content'],
  },
  { line: 4, content: ['mergeRight'], classification: ['content'] },
  { line: 5, content: ['curry'], classification: ['text'] },
  { line: 6, content: ['equals'], classification: ['text'] },
  {
    line: 7,
    content: ['identity', 'I'],
    classification: ['text', 'constant'],
  },
  { line: 9, content: ['pipe'], classification: ['text'] },
  { line: 10, content: ['reject'], classification: ['text'] },
  { line: 11, content: ['replace'], classification: ['text'] },
  { line: 12, content: ['split'], classification: ['text'] },
  {
    line: 13,
    content: ['startsWith'],
    classification: ['content'],
  },
  { line: 14, content: ['trim'], classification: ['text'] },
  {
    line: 16,
    content: ['yargsParser'],
    classification: ['content'],
  },
  {
    line: 18,
    content: ['mapSnd', 'rejectSnd'],
    classification: ['content', 'content'],
  },
  {
    line: 20,
    content: ['createEntitiesFromRaw'],
    classification: ['content'],
  },
  {
    line: 21,
    content: ['dropJSKeywords'],
    classification: ['text'],
  },
  {
    line: 22,
    content: ['dropTSKeywords'],
    classification: ['text'],
  },
  {
    line: 23,
    content: ['dropUserDefinedValues'],
    classification: ['content'],
  },
  {
    line: 25,
    content: ['replaceNoise'],
    classification: ['content'],
  },
  { line: 27, content: ['classify'], classification: ['text'] },
  {
    line: 28,
    content: ['cleanEntities'],
    classification: ['content'],
  },
  {
    line: 29,
    content: ['dropMultilineComments'],
    classification: ['content'],
  },
  {
    line: 30,
    content: ['dropImports'],
    classification: ['content'],
  },
  {
    line: 31,
    content: ['dropStrings'],
    classification: ['content'],
  },
  { line: 32, content: ['cleanups'], classification: ['text'] },
  {
    line: 35,
    content: ['parser', 'curry', 'opts', 'args', 'yargsParser', 'args', 'opts'],
    classification: ['text', 'text', 'text', 'text', 'content', 'text', 'text'],
  },
]
const OUT = {
  entities: [
    ['text', 'histograph'],
    ['content', 'correlateSimilar'],
    ['content', 'mergeRight'],
    ['text', 'curry'],
    ['text', 'equals'],
    ['text', 'identity'],
    ['constant', 'I'],
    ['text', 'pipe'],
    ['text', 'reject'],
    ['text', 'replace'],
    ['text', 'split'],
    ['content', 'startsWith'],
    ['text', 'trim'],
    ['content', 'yargsParser'],
    ['content', 'mapSnd'],
    ['content', 'rejectSnd'],
    ['content', 'createEntitiesFromRaw'],
    ['text', 'dropJSKeywords'],
    ['text', 'dropTSKeywords'],
    ['content', 'dropUserDefinedValues'],
    ['content', 'replaceNoise'],
    ['text', 'classify'],
    ['content', 'cleanEntities'],
    ['content', 'dropMultilineComments'],
    ['content', 'dropImports'],
    ['content', 'dropStrings'],
    ['text', 'cleanups'],
    ['text', 'parser'],
    ['text', 'curry'],
    ['text', 'opts'],
    ['text', 'args'],
    ['content', 'yargsParser'],
    ['text', 'args'],
    ['text', 'opts'],
  ],
  lines: [
    {
      line: 1,
      content: ['histograph', 'correlateSimilar'],
      classification: ['text', 'content'],
    },
    {
      line: 4,
      content: ['mergeRight'],
      classification: ['content'],
    },
    {
      line: 5,
      content: ['curry'],
      classification: ['text'],
    },
    {
      line: 6,
      content: ['equals'],
      classification: ['text'],
    },
    {
      line: 7,
      content: ['identity', 'I'],
      classification: ['text', 'constant'],
    },
    {
      line: 9,
      content: ['pipe'],
      classification: ['text'],
    },
    {
      line: 10,
      content: ['reject'],
      classification: ['text'],
    },
    {
      line: 11,
      content: ['replace'],
      classification: ['text'],
    },
    {
      line: 12,
      content: ['split'],
      classification: ['text'],
    },
    {
      line: 13,
      content: ['startsWith'],
      classification: ['content'],
    },
    {
      line: 14,
      content: ['trim'],
      classification: ['text'],
    },
    {
      line: 16,
      content: ['yargsParser'],
      classification: ['content'],
    },
    {
      line: 18,
      content: ['mapSnd', 'rejectSnd'],
      classification: ['content', 'content'],
    },
    {
      line: 20,
      content: ['createEntitiesFromRaw'],
      classification: ['content'],
    },
    {
      line: 21,
      content: ['dropJSKeywords'],
      classification: ['text'],
    },
    {
      line: 22,
      content: ['dropTSKeywords'],
      classification: ['text'],
    },
    {
      line: 23,
      content: ['dropUserDefinedValues'],
      classification: ['content'],
    },
    {
      line: 25,
      content: ['replaceNoise'],
      classification: ['content'],
    },
    {
      line: 27,
      content: ['classify'],
      classification: ['text'],
    },
    {
      line: 28,
      content: ['cleanEntities'],
      classification: ['content'],
    },
    {
      line: 29,
      content: ['dropMultilineComments'],
      classification: ['content'],
    },
    {
      line: 30,
      content: ['dropImports'],
      classification: ['content'],
    },
    {
      line: 31,
      content: ['dropStrings'],
      classification: ['content'],
    },
    {
      line: 32,
      content: ['cleanups'],
      classification: ['text'],
    },
    {
      line: 35,
      content: [
        'parser',
        'curry',
        'opts',
        'args',
        'yargsParser',
        'args',
        'opts',
      ],
      classification: [
        'text',
        'text',
        'text',
        'text',
        'content',
        'text',
        'text',
      ],
    },
  ],
}

test('getWords', () => {
  expect(getWords).toBeTruthy()
  expect(stripAnsi(getWords(RAW_IN))).toEqual(` - similar (4 references)
 - with (1 reference)`)
})
/* eslint-disable max-len */
test('summarize', () => {
  expect(summarize).toBeTruthy()
  expect(stripAnsi(summarize(RAW_IN))).toEqual(`1. similar
   on lines: 1, 101, 121, 123
2. with
   on lines: 13`)
})
/* eslint-enable max-len */

const REPORT = {
  similar: [1, 101, 121, 123],
  with: [13],
}
test('robotTouristReporter', () => {
  const deets = `SCANNED: src/core.js
The most common words in this file are:
 - similar (4 references)
 - with (1 reference)
These words were found in this pattern:
1. similar
   on lines: 1, 101, 121, 123
2. with
   on lines: 13`
  expect(robotTouristReporter).toBeTruthy()
  expect(
    stripAnsi(
      robotTouristReporter(Infinity, true, {
        file: 'src/core.js',
        report: REPORT,
      })
    ).split('\n')
  ).toEqual(
    `
${BW_LOGO}

${deets}
`.split('\n')
  )
  const d2 = deets.split('\n')
  d2[1] = d2[1].replace(/most/g, '7 most')
  d2.push('')
  expect(
    stripAnsi(
      robotTouristReporter(7, false, {
        file: 'src/core.js',
        report: REPORT,
      })
    ).split('\n')
  ).toEqual(d2)
})
test('dropJSKeywords', () => {
  expect(dropJSKeywords).toBeTruthy()
})
test('dropTSKeywords', () => {
  expect(dropTSKeywords).toBeTruthy()
})
test('dropUserDefinedValues', () => {
  expect(dropUserDefinedValues).toBeTruthy()
  expect(
    dropUserDefinedValues(/useState/g, [
      [0, 'const [$crap, $setCrap] = useState("zipzip")'],
    ])
  ).toEqual([[0, 'const [$crap, $setCrap] = ("zipzip")']])
})
test('createEntitiesFromRaw', () => {
  expect(createEntitiesFromRaw).toBeTruthy()
  expect(createEntitiesFromRaw(IN)).toEqual(OUT)
})
test('createEntities', () => {
  expect(createEntities).toBeTruthy()
  expect(createEntities('cool.biz', [])).toEqual({
    file: 'cool.biz',
    lines: [],
    entities: [],
  })
})
