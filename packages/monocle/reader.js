import path from 'node:path'

import {
  identity as I,
  curry,
  pipe,
  map,
  trim,
  split,
  addIndex,
  chain,
} from 'ramda'
import { parallel } from 'fluture'

import { readDirWithConfig, readFile } from 'file-system'
import { futureFileProcessor } from 'monorail'

import { hash } from './hash'
import { log } from './trace'

export const readMonoFile = curry((basePath, trimContent, file) =>
  pipe(
    log.file('reading'),
    readFile,
    map(buf =>
      pipe(
        split('\n'),
        // ostensibly files have content that starts at a 1 index
        addIndex(map)((y, i) => [i + 1, trimContent ? trim(y) : y]),
        body => ({
          name: path.relative(basePath, file),
          hash: hash(buf),
          body,
        })
      )(buf)
    )
  )(file)
)

export const readAll = curry((config, dirglob) => {
  return pipe(
    log.file('reading glob'),
    readDirWithConfig({ ...config, nodir: true }),
    config.showMatchesOnly
      ? I
      : chain(files =>
          pipe(map(readMonoFile(config.cwd, config.trim)), parallel(10))(files)
        )
  )(dirglob)
})

export const monoprocessor = curry((config, pluginsF, dirGlob) =>
  pipe(
    readAll(config),
    config.showMatchesOnly ? I : futureFileProcessor(config, pluginsF)
  )(dirGlob)
)
