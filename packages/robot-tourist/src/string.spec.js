import {
  matchesCaseFormat,
  classify,
  cleanups,
  getWordsFromEntities,
  parseWords,
  compareContentToWords,
  correlate,
  dropMultilineCommentsWithSteps,
  dropMultilineComments,
  dropImports,
  dropStrings,
  cleanEntities,
} from './string'

test('matchesCaseFormat', () => {
  expect(matchesCaseFormat).toBeTruthy()
  const formatter = z => z.toLowerCase()
  expect(matchesCaseFormat(formatter, 'zippy')).toBeTruthy()
  expect(matchesCaseFormat(formatter, 'ZIPPY')).toBeFalsy()
})

test('classify', () => {
  expect(classify).toBeTruthy()
})

test('cleanups', () => {
  expect(cleanups).toBeTruthy()
  expect(cleanups(['/'])).toBeFalsy()
})

test('getWordsFromEntities', () => {
  expect(getWordsFromEntities).toBeTruthy()
  expect(getWordsFromEntities(true, [], [])).toEqual([])
  expect(getWordsFromEntities(false, [], [])).toEqual([])
})

test('parseWords', () => {
  expect(parseWords).toBeTruthy()
  expect(
    parseWords({
      entities: ['yo'],
      limit: 1,
      skip: false,
      infer: false,
      minimum: 0,
    })
  ).toEqual({ o: 1 })
  expect(
    parseWords({
      entities: ['wizard', 'ghoul'],
      limit: 100,
      skip: false,
      infer: true,
      minimum: 100,
    })
  ).toEqual({})
})

test('compareContentToWords', () => {
  expect(compareContentToWords).toBeTruthy()
  expect(compareContentToWords(false, 0, [], {})).toBeFalsy()
  expect(
    compareContentToWords(true, 0, ['NiceCool'], {
      cool: 0,
    })
  ).toEqual({ matched: true, relationships: [[0, 'cool']] })
  expect(
    compareContentToWords(false, 0, ['NiceCool'], {
      cool: 0,
      nice: 0,
      cool1: 0,
      cool2: 0,
    })
  ).toEqual({ matched: true, relationships: [[0, 'cool']] })
  expect(
    compareContentToWords(false, 0, ['uhhh'], {
      nice: 0,
      cool1: 0,
      cool2: 0,
    })
  ).toEqual({ matched: false, relationships: [] })
})

test('correlate', () => {
  expect(correlate).toBeTruthy()
  expect(correlate(true, { ahoy: 0 }, [{ line: 0, content: 'ahoy' }])).toEqual(
    {}
  )
  expect(
    correlate(true, { ahoy: 0 }, [
      { line: 0, content: ['ahoy', 'ahoj', 'ahoi'] },
      { line: 1, content: ['ahoj'] },
      { line: 2, content: ['ahoi'] },
    ])
  ).toEqual({
    ahoy: [0, 2],
  })
})

test('dropMultilineComments', () => {
  expect(dropMultilineComments).toBeTruthy()
  expect(
    dropMultilineComments([
      [0, '/*'],
      [1, ' * I love commments'],
      [2, '*/'],
      [3, 'export const cool = 5'],
    ])
  ).toEqual([[3, 'export const cool = 5']])
})

test('cleanEntities', () => {
  expect(cleanEntities).toBeTruthy()
})
