export const BW_LOGO = `     /\\/\\
    /^^^^\\
  <d______b>
   |(☉  ☉)|
   (∏∏∏∏∏∏)
  ⎛⎝      ⎠⎞`

export const DYNAMIC_BANNER = c => `     /\\/\\
    /^^^^\\
  <d______b>
   |(${c.red('☉')}  ${c.red('☉')})|
   (${c.yellow('∏∏∏∏∏∏')})
  ⎛⎝      ⎠⎞`

export const CONFIG = {
  alias: {
    help: ['h'],
    color: ['k'],
    fun: ['f'],
    limit: ['l'],
    ignore: ['i'],
    ignoreTokens: ['t'],
    skipWords: ['w'],
    dropStrings: ['s'],
    histogramMinimum: ['hits', 'm'],
    assumeSimilarWords: ['similar', 'a'],
    dropJSKeywords: ['j'],
    dropTSKeywords: ['J'],
  },
  array: ['skipWords', 'ignoreTokens', 'ignore'],
  boolean: [
    'dropStrings',
    'assumeSimilarWords',
    'dropJSKeywords',
    'dropTSKeywords',
    'fun',
    'color',
  ],
  number: ['histogramMinimum'],
  configuration: { 'strip-aliased': true },
}

export const CERTAIN_COMMON_WORDS = ['use', 'get', 'id']
export const USER_DEFINED_VALUES = []

export const DEFAULT_CONFIG = {
  color: true,
  assumeSimilarWords: true,
  dropJSKeywords: true,
  dropImports: true,
  dropStrings: true,
  dropTSKeywords: true,
  fun: true,
  help: false,
  histogramMinimum: 1,
  ignore: USER_DEFINED_VALUES,
  ignoreTokens: CERTAIN_COMMON_WORDS,
  limit: Infinity,
  skipWords: [],
}

export const HELP_CONFIG = {
  help: 'This text!',
  color: `Render things in glorious color!`,
  fun: 'Show the robot',
  limit: 'What top number of words do you want to see? (default: Infinity)',
  skipWords: 'Ignore a given word (this should be merged with --ignore)',
  ignore: 'Ignore a matched string (can be specified multiple times)',
  ignoreTokens:
    'Ignore a token once it is processed (more reliable than `--ignore`)',
  dropStrings: 'Should strings be retained or removed?',
  histogramMinimum: 'What is the minimum number of matches as a threshold?',
  assumeSimilarWords: 'Should we attempt to infer whether words are similar?',
  dropJSKeywords: 'Should JS keywords be dropped? (default: true)',
  dropTSKeywords: 'Should TS keywords be dropped? (default: true)',
}
