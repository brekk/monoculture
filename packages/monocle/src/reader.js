import path from 'node:path'

import {
  curry,
  pipe,
  map,
  split,
  addIndex,
  fromPairs,
  chain,
  __ as $,
} from 'ramda'
import { parallel } from 'fluture'

import { readDir, readFile } from 'file-system'
import { taskProcessor } from 'monoplug'

import { hash } from './hash'

export const readMonoFile = curry((basePath, file) => {
  return pipe(
    readFile,
    map(buf =>
      pipe(
        split('\n'),
        addIndex(map)((y, i) => [i, y]),
        lines => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          lines,
        })
      )(buf)
    )
  )(file)
})

export const reader = curry(({ basePath }, dirglob) =>
  pipe(
    readDir,
    chain(files =>
      pipe(
        map(readMonoFile(basePath)),
        parallel(10),
        map(content => ({
          content,
          files: pipe(
            map(f => [f.hash, f.file]),
            fromPairs
          )(content),
        }))
      )(files)
    )
  )(dirglob)
)

export const monoprocessor = curry(({ basePath }, plugins, dirGlob) =>
  pipe(reader({ basePath }), map(taskProcessor($, plugins)))(dirGlob)
)
