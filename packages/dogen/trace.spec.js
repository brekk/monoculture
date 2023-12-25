import { binaryEffect } from './trace'

test('binaryEffect', () => {
  const rando = Math.round(Math.random() * 1e8)
  const callable = jest.fn()
  expect(binaryEffect(callable, 'hey now', rando)).toEqual(rando)
  expect(callable).toHaveBeenCalledWith('hey now', rando)
})
