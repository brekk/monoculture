import { pathRelativeTo } from './path'

test('pathRelativeTo', () => {
  expect(
    pathRelativeTo(__dirname, '../../data-hooks').split('/').slice(-2)
  ).toEqual(['packages', 'data-hooks'])
})

test('pathRelativeTo - fails', () => {
  expect(() => pathRelativeTo(2, 2)).toThrow('Cannot normalize bad paths.')
})
