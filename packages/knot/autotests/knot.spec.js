import { strepeat } from '../knot'
test('strepeat', () => {
  expect(strepeat('=', 5)).toEqual('=====')
})
