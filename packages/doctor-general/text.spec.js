import { trimComment, nixKeyword, wipeComment, formatComment } from './text'

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

test('trimComment', () => {
  expect(trimComment('          * zipzop')).toEqual('zipzop')
  expect(trimComment(' * squiggle         ')).toEqual('squiggle')
  const input = ' ~~kljlkjlk2j32lkj3 ' + Math.round(Math.random() * 1000)
  expect(trimComment(input)).toEqual(input)
  expect(trimComment(29292)).toEqual(29292)
})
