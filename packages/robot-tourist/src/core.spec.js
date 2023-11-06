import {
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
test('parse', () => {
  expect(parse).toBeTruthy()
})
test('parseAndClassify', () => {
  expect(parseAndClassify).toBeTruthy()
})
test('parseAndClassifyWithFile', () => {
  expect(parseAndClassifyWithFile).toBeTruthy()
})
test('robotTourist', () => {
  expect(robotTourist).toBeTruthy()
})
