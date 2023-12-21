import { fence } from './string'

const AI = 'a/b/c/d/e/f/g/h/i'
test('fence', () => {
  expect(fence).toBeTruthy()
  expect(fence('/', 5, AI)).toEqual('a/b/c/d/e')
})
test('fence - negative slice', () => {
  expect(fence('/', -5, AI)).toEqual('e/f/g/h/i')
})
