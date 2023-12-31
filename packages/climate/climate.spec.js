import * as CLIMATE from './climate'
test('CLIMATE exports', () => {
  expect(Object.keys(CLIMATE)).toEqual([
    'failIfMissingFlag',
    'generateHelp',
    'invalidHelpConfig',
    'longFlag',
    'shortFlag',
    'NO_OP',
    'configFile',
    'configFileWithCancel',
    'configurate',
    'defaultNameTemplate',
    'pluginToCondMap',
    'showHelpWhen',
    'parse',
  ])
})
