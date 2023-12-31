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
