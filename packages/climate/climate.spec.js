import * as CLIMATE from './climate'
test('CLIMATE exports', () => {
  expect(Object.keys(CLIMATE).sort()).toEqual([
    'NO_OP',
    'configFile',
    'configFileWithCancel',
    'configurate',
    'defaultNameTemplate',
    'failIfMissingFlag',
    'generateHelp',
    'interrupt',
    'invalidHelpConfig',
    'longFlag',
    'parse',
    'pluginToCondMap',
    'shortFlag',
    'showHelpWhen',
  ])
})
