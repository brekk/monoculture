import * as DR_GEN from './doctor-general'

test('default export', () => {
  expect(DR_GEN).toMatchSnapshot()
})
