import path from 'node:path'

import { curry, pipe, map, split, addIndex, fromPairs, chain } from 'ramda'
import { parallel, resolve } from 'fluture'

import { readDirWithConfig, readFile } from 'file-system'
import { futureFileProcessor } from 'monoplug'

import { hash } from './hash'

export const readMonoFile = curry((basePath, file) => {
  return pipe(
    readFile,
    map(buf =>
      pipe(
        split('\n'),
        addIndex(map)((y, i) => [i, y]),
        body => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          body,
        })
      )(buf)
    )
  )(file)
})

export const reader = curry((config, dirglob) =>
  pipe(
    readDirWithConfig(config),
    chain(files =>
      pipe(map(readMonoFile(config.basePath)), parallel(10))(files)
    )
  )(dirglob)
)

export const monoprocessor = curry((config, plugins, dirGlob) =>
  pipe(reader(config), futureFileProcessor(config, resolve(plugins)))(dirGlob)
)
