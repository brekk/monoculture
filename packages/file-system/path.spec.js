import { pathJoin } from './path'

test('pathJoin', () => {
  expect(pathJoin(__dirname, '../data-hooks').split('/').slice(-2)).toEqual([
    'packages',
    'data-hooks',
  ])
})

test('pathJoin - fails', () => {
  expect(() => pathJoin(2, 2)).toThrow('Cannot normalize bad paths.')
})
