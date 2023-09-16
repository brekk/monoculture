import * as MONODOC from './index'

test('default export', () => {
  expect(MONODOC).toMatchSnapshot()
})
