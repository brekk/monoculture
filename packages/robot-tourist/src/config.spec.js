import {
  BW_LOGO,
  CONFIG,
  CERTAIN_COMMON_WORDS,
  USER_DEFINED_VALUES,
  DEFAULT_CONFIG,
  HELP_CONFIG,
} from './config'
import stripAnsi from 'strip-ansi'

test('BW_LOGO', () => {
  expect(BW_LOGO).toMatchSnapshot()
})
test('CONFIG', () => {
  expect(CONFIG).toMatchSnapshot()
})
test('CERTAIN_COMMON_WORDS', () => {
  expect(CERTAIN_COMMON_WORDS).toMatchSnapshot()
})
test('USER_DEFINED_VALUES', () => {
  expect(USER_DEFINED_VALUES).toMatchSnapshot()
})
test('DEFAULT_CONFIG', () => {
  expect(DEFAULT_CONFIG).toMatchSnapshot()
})
test('HELP_CONFIG', () => {
  expect(HELP_CONFIG).toMatchSnapshot()
})
