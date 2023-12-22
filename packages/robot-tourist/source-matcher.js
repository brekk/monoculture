import { anyPass, includes, replace } from 'ramda'
import { SOURCE_CODE_NOISE } from './constants'

export const evidenceOfImports = anyPass([
  includes('from'),
  includes('require'),
  includes('import'),
])
export const replaceNoise = replace(SOURCE_CODE_NOISE, ' ')
