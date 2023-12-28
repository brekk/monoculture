import { isNotEmpty } from './array'
test('isNotEmpty', () => {
  expect(isNotEmpty).toBeTruthy()
  expect(isNotEmpty([1, 2, 3, 4])).toBeTruthy()
  expect(isNotEmpty([])).toBeFalsy()
})
