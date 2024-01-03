import { CONFIG, CONFIG_DEFAULTS, HELP_CONFIG } from './config'

test('CONFIG', () => {
  expect(CONFIG).toMatchSnapshot()
})
test('CONFIG_DEFAULTS', () => {
  expect(CONFIG_DEFAULTS).toMatchSnapshot()
})
test('HELP_CONFIG', () => {
  expect(HELP_CONFIG).toMatchSnapshot()
})
