import MAIN from './index'

test('default', () => {
  expect(Object.keys(MAIN)).toEqual([
    'output',
    'group',
    'process',
    'renderer',
    'postRender',
  ])
})
