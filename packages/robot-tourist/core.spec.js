import {
  simplifier,
  parser,
  classifyEntities,
  parse,
  parseAndClassify,
  parseAndClassifyWithFile,
  robotTourist,
} from './core'

test('parser', () => {
  expect(parser).toBeTruthy()
})
test('classifyEntities', () => {
  expect(classifyEntities).toBeTruthy()
  expect(
    classifyEntities([[0, 'export const cool = "yes"'.split(' ')]])
  ).toEqual({
    entities: {
      string: ['"yes"'],
      text: ['=', 'const', 'cool', 'export'],
    },
    lines: [
      {
        classification: ['text', 'text', 'text', 'text', 'string'],
        content: ['export', 'const', 'cool', '=', '"yes"'],
        line: 0,
      },
    ],
  })
})
const INPUT = [
  [1, "import { histograph, correlateSimilar } from './stats'"],
  [2, ''],
  [3, 'import {'],
  [4, 'mergeRight,'],
  [5, 'curry,'],
  [6, 'identity as I,'],
  [7, 'map,'],
  [8, 'pipe,'],
  [9, 'reject,'],
  [10, 'replace,'],
  [11, 'split,'],
  [12, 'startsWith,'],
  [13, 'trim,'],
  [14, "} from 'ramda'"],
  [15, "import { trace } from 'xtrace'"],
  [16, "import yargsParser from 'yargs-parser'"],
  [17, ''],
  [18, "import { mapSnd, rejectSnd } from './tuple'"],
  [19, 'import {'],
  [20, 'createEntitiesFromRaw,'],
  [21, 'dropJSKeywords,'],
  [22, 'dropTSKeywords,'],
  [23, 'dropUserDefinedValues,'],
  [24, "} from './reporter'"],
  [25, "import { replaceNoise } from './source-matcher'"],
  [26, 'import {'],
  [27, 'classify,'],
  [28, 'cleanEntities,'],
  [29, 'dropMultilineComments,'],
  [30, 'dropImports,'],
  [31, 'dropStrings,'],
  [32, 'cleanups,'],
  [33, "} from './string'"],
  [34, ''],
  [35, 'export const parser = curry((opts, args) => yargsParser(args, opts))'],
  [36, ''],
  [37, 'export const classifyEntities = pipe('],
  [38, '// convert to object'],
  [39, 'map(([line, content]) => ({'],
  [40, 'line,'],
  [41, 'content,'],
  [42, 'classification: map(classify)(content),'],
  [43, '})),'],
  [44, '// do some secondary logic now that we have classification'],
  [45, 'createEntitiesFromRaw,'],
  [46, '// clean up entities to be more useful'],
  [47, 'cleanEntities'],
  [48, ')'],
]
const OUTPUT_ALL_DROPPED = [
  [4, ['mergeRight']],
  [5, ['curry']],
  [6, ['identity', 'I']],
  [8, ['pipe']],
  [9, ['reject']],
  [10, ['replace']],
  [11, ['split']],
  [12, ['startsWith']],
  [13, ['trim']],
  [20, ['createEntitiesFromRaw']],
  [21, ['dropJSKeywords']],
  [22, ['dropTSKeywords']],
  [23, ['dropUserDefinedValues']],
  [27, ['classify']],
  [28, ['cleanEntities']],
  [29, ['dropMultilineComments']],
  [30, ['dropImports']],
  [31, ['dropStrings']],
  [32, ['cleanups']],
  [35, ['parser', 'curry', 'opts', 'args', 'yargsParser', 'args', 'opts']],
  [37, ['classifyEntities', 'pipe']],
  [39, ['line', 'content']],
  [40, ['line']],
  [41, ['content']],
  [42, ['classification', 'classify', 'content']],
  [45, ['createEntitiesFromRaw']],
  [47, ['cleanEntities']],
]

const OUTPUT_NONE_DROPPED = [
  [1, ['import', 'histograph', 'correlateSimilar', 'from', "'"]],
  [3, ['import']],
  [4, ['mergeRight']],
  [5, ['curry']],
  [6, ['identity', 'as', 'I']],
  [7, ['map']],
  [8, ['pipe']],
  [9, ['reject']],
  [10, ['replace']],
  [11, ['split']],
  [12, ['startsWith']],
  [13, ['trim']],
  [14, ['from', "'ramda'"]],
  [15, ['import', 'trace', 'from', "'xtrace'"]],
  [16, ['import', 'yargsParser', 'from', "'yargs-parser'"]],
  // TODO: this is wrong but something to fix later
  // it ought to include `'./source-matcher'`
  [18, ['import', 'mapSnd', 'rejectSnd', 'from', "'"]],
  [19, ['import']],
  [20, ['createEntitiesFromRaw']],
  [21, ['dropJSKeywords']],
  [22, ['dropTSKeywords']],
  [23, ['dropUserDefinedValues']],
  [24, ['from', "'"]],
  [25, ['import', 'replaceNoise', 'from', "'"]],
  [26, ['import']],
  [27, ['classify']],
  [28, ['cleanEntities']],
  [29, ['dropMultilineComments']],
  [30, ['dropImports']],
  [31, ['dropStrings']],
  [32, ['cleanups']],
  [33, ['from', "'"]],
  [
    35,
    [
      'export',
      'const',
      'parser',
      'curry',
      'opts',
      'args',
      'yargsParser',
      'args',
      'opts',
    ],
  ],
  [37, ['export', 'const', 'classifyEntities', 'pipe']],
  [39, ['map', 'line', 'content']],
  [40, ['line']],
  [41, ['content']],
  [42, ['classification', 'map', 'classify', 'content']],
  [45, ['createEntitiesFromRaw']],
  [47, ['cleanEntities']],
]

test('parse', () => {
  expect(parse).toBeTruthy()
  expect(
    parse(
      {
        ignore: [],
        dropImports: true,
        dropStrings: true,
        dropJSKeywords: true,
        dropTSKeywords: true,
      },
      INPUT
    )
  ).toEqual(OUTPUT_ALL_DROPPED)
})
test('parse - all false', () => {
  expect(
    parse(
      {
        ignore: [],
        dropImports: false,
        dropStrings: false,
        dropJSKeywords: false,
        dropTSKeywords: false,
      },
      INPUT
    )
  ).toEqual(OUTPUT_NONE_DROPPED)
})
test('parseAndClassify', () => {
  expect(parseAndClassify).toBeTruthy()
  expect(parseAndClassify({}, [])).toEqual({ entities: {}, lines: [] })
})

test('simplifier', () => {
  expect(simplifier).toBeTruthy()
  expect(simplifier({}, [])).toEqual({ entities: {}, lines: [] })
})
test('parseAndClassifyWithFile', () => {
  expect(parseAndClassifyWithFile).toBeTruthy()
  expect(parseAndClassifyWithFile('file.biz', {}, [])).toEqual({
    file: 'file.biz',
    entities: {},
    lines: [],
  })
})
test('robotTourist', () => {
  expect(robotTourist).toBeTruthy()
  expect(robotTourist({ file: 'cool.biz' }, [])).toEqual({
    entities: {},
    file: 'cool.biz',
    lines: [],
    report: {},
    words: {},
  })
})
