import path from 'node:path'

import { curry, pipe, map, split, addIndex, fromPairs, chain } from 'ramda'
import { parallel, resolve } from 'fluture'
import { trace } from 'xtrace'

import { readDirWithConfig, readFile } from 'file-system'
import { futureFileProcessor } from 'monorail'

import { hash } from './hash'

export const readMonoFile = curry((basePath, file) =>
  pipe(
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
)

export const readAll = curry((config, dirglob) =>
  pipe(
    trace('readallllll'),
    readDirWithConfig(config),
    map(trace('oh hey')),
    chain(files =>
      pipe(map(readMonoFile(config.basePath)), parallel(10))(files)
    )
  )(dirglob)
)

export const monoprocessor = curry((config, plugins, dirGlob) =>
  pipe(
    trace('dirglobbo'),
    readAll(config),
    map(trace('glibbo')),
    futureFileProcessor(config, resolve(plugins))
  )(dirGlob)
)
