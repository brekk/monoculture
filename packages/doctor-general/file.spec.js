import { map } from 'ramda'
import {
  combineFiles,
  addLineNumbers,
  findJSDocKeywords,
  cleanupKeywords,
  groupContiguousBlocks,
  isJSDocComment,
} from './file'

test('isJSDocComment', () => {
  expect(isJSDocComment).toBeTruthy()
  expect(isJSDocComment('test')).toBeFalsy()
  expect(isJSDocComment('/**')).toBeTruthy()
  expect(isJSDocComment('          *')).toBeTruthy()
  expect(isJSDocComment('      */')).toBeTruthy()
})

test('addLineNumbers', () => {
  expect(typeof addLineNumbers).toEqual('function')

  expect(addLineNumbers('hey cool'.split(''))).toEqual([
    [0, 'h'],
    [1, 'e'],
    [2, 'y'],
    [3, ' '],
    [4, 'c'],
    [5, 'o'],
    [6, 'o'],
    [7, 'l'],
  ])
})
test('findJSDocKeywords', () => {
  expect(typeof findJSDocKeywords).toEqual('function')
  expect(
    findJSDocKeywords(
      'lorem ipsum dolor sit amet @example cool @hey @there @nice yo yo yo'
    )
  ).toEqual(['@example', '@hey', '@there', '@nice'])
})
test('cleanupKeywords', () => {
  expect(typeof cleanupKeywords).toEqual('function')
  expect(
    map(cleanupKeywords)(['@cool shit', '@nice dope', '@dope cool'])
  ).toEqual([
    ['cool', 'shit'],
    ['nice', 'dope'],
    ['dope', 'cool'],
  ])
})
test('groupContiguousBlocks', () => {
  expect(typeof groupContiguousBlocks).toEqual('function')
  expect(
    groupContiguousBlocks([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
      [3, 'd'],
      [4, 'e'],
      [5, 'f'],
      [16, 'g'],
      [17, 'h'],
      [18, 'i'],
      [19, 'j'],
      [20, 'k'],
    ])
  ).toEqual([
    [
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
      [3, 'd'],
      [4, 'e'],
      [5, 'f'],
    ],
    [
      [16, 'g'],
      [17, 'h'],
      [18, 'i'],
      [19, 'j'],
      [20, 'k'],
    ],
  ])
  expect(groupContiguousBlocks([])).toEqual([])
})

test('combineFiles', () => {
  const a = {
    a: true,
    greeting: 'hello',
    comments: ['one', 'two'],
    links: ['a', 'b'],
  }
  const b = {
    b: true,
    greeting: 'ahoy',
    comments: ['three', 'four'],
    links: ['c', 'd'],
  }
  expect(combineFiles(true, a, b)).toEqual({
    a: true,
    b: true,
    greeting: 'ahoy',
    comments: ['one', 'two', 'three', 'four'],
    links: ['a', 'b', 'c', 'd'],
  })
  expect(combineFiles(false, a, b)).toEqual({
    a: true,
    b: true,
    greeting: 'hello',
    comments: ['three', 'four', 'one', 'two'],
    links: ['c', 'd', 'a', 'b'],
  })
})
