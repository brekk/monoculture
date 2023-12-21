import {
  trimComment,
  nixKeyword,
  wipeComment,
  formatComment,
  lines,
  unlines,
  j2,
} from './text'

test('trimComment', () => {
  expect(trimComment('        * zipzop')).toEqual('zipzop')
})

test('nixKeyword', () => {
  expect(nixKeyword('@zipzop')).toEqual('zipzop')
})

test('wipeComment', () => {
  expect(wipeComment('         * @zipzop')).toEqual('zipzop')
})

test('formatComment', () => {
  expect(
    formatComment([
      [0, '/**'],
      [1, ' * @zipzop'],
      [2, ' */'],
    ])
  ).toEqual(['@zipzop'])
})

test('lines', () => {
  expect(
    lines(`a
b
c`)
  ).toEqual(['a', 'b', 'c'])
})
test('unlines', () => {
  expect(unlines(['a', 'b', 'c'])).toEqual(`a
b
c`)
})

test('j2', () => {
  expect(j2({ a: { b: { c: ['e', 'f'] } } })).toEqual(`{
  "a": {
    "b": {
      "c": [
        "e",
        "f"
      ]
    }
  }
}`)
})
