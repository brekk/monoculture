import { pipe, map, chain } from 'ramda'
import { parallel } from 'fluture'

import { readDir } from 'file-system'

import { reader } from './reader'

export const monocle = pipe(readDir, map(map(reader)), chain(parallel(10)))
