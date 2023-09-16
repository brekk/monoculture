import * as DAFFY_DOC from './index'

test('default export', () => {
  expect(DAFFY_DOC).toMatchSnapshot()
})
