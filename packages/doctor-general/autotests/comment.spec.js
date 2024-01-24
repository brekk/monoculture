// This test automatically generated by doctor-general.
// Sourced from 'comment.js', edits to this file may be erased.
import {
  structureComment,
  getExample,
  stripEmptyCommentLines,
  isAsterisky,
  getPageSummary,
  matchLinks,
  getImportsForTests,
  hasExample,
} from '../comment'

test('hasExample', () => {
  expect(hasExample({ structure: { example: [`test=true`] } })).toBeTruthy()
  expect(hasExample({})).toBeFalsy()
  expect(hasExample('zipzop')).toBeFalsy()
})

test('getImportsForTests', () => {
  const file = {
    comments: [
      {
        structure: {
          curried: [
            { name: 'coolWithConfig', lines: ['test=true'] },
            { name: 'cool', lines: ['test=true'] },
          ],
        },
      },
      {
        structure: { name: 'otherFunc', example: ['test=true'] },
      },
    ],
  }

  expect(getImportsForTests(file)).toEqual([
    'otherFunc',
    'coolWithConfig',
    'cool',
  ])
})

test('matchLinks', () => {
  expect(matchLinks([])).toEqual([])
  expect(matchLinks([`{@link cool}`])).toEqual(['cool'])
})

test('getPageSummary', () => {
  const rawLines = [
    ' * @pageSummary Hey cool this is a multi-line',
    ' * description of stuff in the whole file',
    ' * @page testPageSummary',
    ' * @huh notSure',
  ]
  expect(getPageSummary(rawLines, Infinity, 0)).toEqual([
    'Hey cool this is a multi-line',
    'description of stuff in the whole file',
  ])
  expect(getPageSummary([' * hey', ' * there'], Infinity, 0)).toEqual([
    'hey',
    'there',
  ])
})

test('isAsterisky', () => {
  expect(isAsterisky('     * ')).toBeTruthy()
  expect(isAsterisky('*')).toBeTruthy()
  expect(isAsterisky('obelisk')).toBeFalsy()
})

test('stripEmptyCommentLines', () => {
  expect(stripEmptyCommentLines('     *')).toEqual('')
  expect(stripEmptyCommentLines('hooray!')).toEqual('hooray!')
})

test('getExample', () => {
  const rawLines = [
    '* Ouroboric summary',
    '* @name getExample',
    '* @example',
    '* ```js',
    '* getExample(rawLines)',
    '* ```',
  ]
  expect(getExample(rawLines, 5, 3)).toEqual('getExample(rawLines)')
})

test('structureComment', () => {
  expect(structureComment([0, ' * @cool nice yes'])).toEqual('???')
})
