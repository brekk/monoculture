// This test automatically generated by doctor-general.
// Sourced from 'builder.js', edits to this file may be erased.
import { configurate } from '../builder'

import { fork } from 'fluture'
import stripAnsi from 'strip-ansi'
test('configurate', done => {
  const YARGS_CONFIG = {
    alias: {
      meal: ['m'],
      happyHour: ['h'],
      multiplier: ['x'],
    },
    boolean: ['happyHour'],
    number: ['multiplier'],
    configuration: {
      'strip-aliased': true,
    },
  }

  const HELP_CONFIG = {
    help: 'This text!',
    // optional
    color: 'Render stuff in color',
    meal: 'Pass the name of the meal you want',
    happyHour: 'Does happy hour apply here?',
    multiplier: 'How many units should we apply?',
  }

  const CONFIG_DEFAULTS = {
    color: true,
    happyHour: false,
  }

  const parseArgs = args =>
    configurate(
      YARGS_CONFIG,
      // closured so that we can pass cwd at runtime
      { ...CONFIG_DEFAULTS, cwd: process.cwd() },
      HELP_CONFIG,
      { name: 'dumbwaiter', description: 'order food!' },
      // process.argv.slice(2)
      args
    )

  // renders in the failure channel
  fork(x => {
    expect(stripAnsi(x).split('\n')).toEqual([
      ' dumbwaiter ',
      '',
      'order food!',
      '',
      '  -m / --meal',
      '  	Pass the name of the meal you want',
      '',
      '  -h / --happyHour',
      '  	Does happy hour apply here?',
      '',
      '  -x / --multiplier',
      '  	How many units should we apply?',
      '',
      '  -h / --help',
      '  	This text!',
    ])
    done()
  })(done)(parseArgs(['--help']))
})
