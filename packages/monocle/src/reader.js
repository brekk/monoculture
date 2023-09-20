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
import { fileProcessor } from 'monoplug'

import { hash } from './hash'
const trace = curry((a, b) => {
  // eslint-disable-next-line no-console
  console.log(a, b)
  return b
})

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

export const reader = curry(({ basePath }, dirglob) =>
  pipe(
    trace('>>@>@>@'),
    readDir,
    map(trace('dir files')),
    chain(files =>
      pipe(
        map(readMonoFile(basePath)),
        parallel(10),
        map(trace('files')),
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

export const monoprocessor = curry((config, plugins, dirGlob) =>
  pipe(
    reader({ basePath: config.basePath }),
    map(xxx => fileProcessor(config, plugins, xxx.content))
  )(dirGlob)
)
