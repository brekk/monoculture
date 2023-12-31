import { YARGS_CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'

test('YARGS_CONFIG', () => {
  expect(YARGS_CONFIG).toMatchSnapshot()
})
test('HELP_CONFIG', () => {
  expect(HELP_CONFIG).toMatchSnapshot()
})
test('CONFIG_DEFAULTS', () => {
  expect(CONFIG_DEFAULTS).toMatchSnapshot()
})
