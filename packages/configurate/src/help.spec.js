import pkg from '../package.json'

import { map } from 'ramda'
import Unusual from 'unusual'
import {
  shortFlag,
  longFlag,
  invalidHelpConfig,
  failIfMissingFlag,
  generateHelp,
} from './help'

const u = Unusual(pkg.name + '@' + pkg.version)

test('shortFlag', () => {
  expect(shortFlag).toBeTruthy()
  expect(map(shortFlag)('abcde'.split(''))).toEqual([
    '-a',
    '-b',
    '-c',
    '-d',
    '-e',
  ])
})
test('longFlag', () => {
  expect(longFlag).toBeTruthy()
  expect(map(longFlag)('abcde'.split(''))).toEqual([
    '--a',
    '--b',
    '--c',
    '--d',
    '--e',
  ])
})
test('invalidHelpConfig', () => {
  expect(invalidHelpConfig).toBeTruthy()
  expect(() => invalidHelpConfig('crapcrap')).toThrow(
    'You must add a "crapcrap" key to the helpConfig!'
  )
})
test('failIfMissingFlag', () => {
  const x = u.int(1, 1000)
  expect(failIfMissingFlag).toBeTruthy()
  const failure = failIfMissingFlag('anything', 'crapcrap')
  expect(failure(x)).toEqual(x)
  expect(() => failure('???')).toThrow(
    'You must add a "crapcrap" key to the helpConfig!'
  )
})
test('generateHelp - good nonsense', () => {
  expect(generateHelp).toBeTruthy()
  const CONFIG = {
    alias: {
      grables: ['g'],
      snorbles: ['s'],
      skurpskorps: ['sk', 'k'],
    },
  }
  const HELP_CONFIG = {
    grables: 'qualdal smungobal',
    snorbles: 'borflak neue neue',
    skurpskorps: 'scurr scurr',
  }
  const GENERATED_HELP = generateHelp('hochopepa', HELP_CONFIG, CONFIG)
  expect(GENERATED_HELP).toEqual(`hochopepa

-g / --grables
  qualdal smungobal

-s / --snorbles
  borflak neue neue

--sk / -k / --skurpskorps
  scurr scurr`)
})

test('generateHelp - missing parts', () => {
  expect(generateHelp).toBeTruthy()
  const CONFIG = {
    alias: {
      grables: ['g'],
      snorbles: ['s'],
      skurpskorps: ['sk', 'k'],
    },
  }
  const HELP_CONFIG = {
    grables: 'qualdal smungobal',
    snorbles: 'borflak neue neue',
  }
  expect(() => generateHelp('hochopepa', HELP_CONFIG, CONFIG)).toThrow(
    'You must add a "skurpskorps" key to the helpConfig!'
  )
})
