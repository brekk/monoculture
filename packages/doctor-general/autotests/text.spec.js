// This test automatically generated by doctor-general.
// Sourced from 'text.js', edits to this file may be erased.
import { trimComment } from '../text'

test('trimComment', () => {
  expect(trimComment(' * zipzop')).toEqual('zipzop')
  expect(trimComment(' * squiggle ')).toEqual('squiggle')
  const input = ' ~~kljlkjlk2j32lkj3 ' + Math.round(Math.random() * 1000)
  expect(trimComment(input)).toEqual(input)
  expect(trimComment(29292)).toEqual(29292)
})
