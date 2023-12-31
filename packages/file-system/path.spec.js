import { relativePathJoin } from './path'

test('relativePathJoin', () => {
  expect(
    relativePathJoin(__dirname, '../data-hooks').split('/').slice(-2)
  ).toEqual(['packages', 'data-hooks'])
})

test('relativePathJoin - fails', () => {
  expect(() => relativePathJoin(2, 2)).toThrow(
    'Cannot normalize bad paths, given (2, 2).'
  )
})
