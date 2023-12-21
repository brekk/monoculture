import fs from 'node:fs'
import { sep } from 'node:path'
import { reduce, F, propOr, without, curry, pipe, map, __ as $ } from 'ramda'
import {
  Future,
  chain,
  chainRej,
  isFuture,
  mapRej,
  parallel,
  race,
} from 'fluture'
import glob from 'glob'

/* eslint-disable max-len */
/**
 * @pageSummary A Future-wrapped `fs` API, for future-based, lazy, easy-to-model asynchrony that makes it easy to manipulate the file system.
 */
/* eslint-enable max-len */

const { constants } = fs

export const NO_OP = () => {}

// fs functions that use callbacks of specific arity; a helper
// const [__cb, __cb2, __cb3] = map(passFailCallbackWithArity, [1, 2, 3])

/**
 * make a file string relative
 * @name localize
 * @example
 * ```js
 * import { localize } from 'file-system'
 * console.log(`support ${localize('business')}`)
 * // support ./business
 * ```
 */
export const localize = z => `.${sep}${z}`

/**
 * Read a file asynchronously as a Future-wrapped value,
 * given a file encoding and a cancellation function.
 * @name readFileWithFormatAndCancel
 * @see {@link readFileWithCancel}
 * @see {@link readFile}
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readFile } from 'file-system'
 * fork(console.warn)(console.log)(
 *   readFileWithFormatAndCancel(() => process.exit(), 'utf32', './README.md')
 * )
 * ```
 */
export const readFileWithFormatAndCancel = curry((cancel, format, x) =>
  Future((bad, good) => {
    fs.readFile(x, format, (err, data) => (err ? bad(err) : good(data)))
    return cancel
  })
)

/**
 * Read a file asynchronously as a Future-wrapped value, given a cancellation function.
 * Reads `utf8` files only, use `readFileWithFormatAndCancel` if another file encoding is needed.
 * @name readFileWithCancel
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readFile } from 'file-system'
 * fork(console.warn)(console.log)(readFileWithCancel(() => process.exit(), './README.md'))
 * ```
 */
export const readFileWithCancel = readFileWithFormatAndCancel($, 'utf8')

/**
 * read a file asynchronously as a Future-wrapped value
 * @name readFile
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readFile } from 'file-system'
 * fork(console.warn)(console.log)(readFile('./README.md'))
 * ```
 */
export const readFile = readFileWithCancel(NO_OP)

/**
 * read a JSON file asynchronously and future wrapped
 * @name readJSONFile
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readJSONFile } from 'file-system'
 * fork(console.warn)(console.log)(readJSONFile('./package.json'))
 * ```
 */
export const readJSONFileWithCancel = curry((cancel, x) =>
  pipe(readFileWithCancel(cancel), map(JSON.parse))(x)
)
export const readJSONFile = readJSONFileWithCancel(NO_OP)

/**
 * read a `glob` asynchronously and future wrapped, with configuration
 * @name readDirWithConfig
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readDirWithConfig } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(readDirWithConfig({}, 'src/*'))
 * // [...]
 * pipe(
 *   fork(console.warn)(console.log)
 * )(readDirWithConfig({ ignore: ['node_modules/**'] }, 'src/*'))
 * ```
 */
export const readDirWithConfigAndCancel = curry((cancel, conf, g) =>
  Future((bad, good) => {
    try {
      glob(g, conf, (e, x) =>
        // thus far I cannot seem to ever call `bad` from within here
        e ? bad(e) : good(x)
      )
    } catch (e) {
      bad(e)
    }
    return cancel
  })
)

export const readDirWithConfig = readDirWithConfigAndCancel(NO_OP)

/**
 * read a `glob` asynchronously and future wrapped, no config needed
 * @name readDir
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readDirWithConfig } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(readDir('src/*'))
 * ```
 */
export const readDir = readDirWithConfig({})

/**
 * Write a file, with configuration
 * @name writeFileWithConfig
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { writeFileWithConfig } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   writeFileWithConfig(
 *     { ...fs.writeFileConfig },
 *     'my-file.txt',
 *     'hey I am a file'
 *   )
 * )
 * ```
 */
export const writeFileWithConfigAndCancel = curry(
  (cancel, conf, file, content) =>
    Future((bad, good) => {
      fs.writeFile(file, content, conf, e => {
        if (e) {
          bad(e)
          return
        }
        good(content)
      })
      return cancel
    })
)

export const writeFileWithConfig = writeFileWithConfigAndCancel(NO_OP)

/**
 * Write a file, assuming 'utf8'
 * @name writeFile
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { writeFile } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   writeFile(
 *     'my-file.txt',
 *     'hey I am a file'
 *   )
 * )
 * ```
 */
export const writeFile = writeFileWithConfig({ encoding: 'utf8' })

/**
 * Remove a file, configurably
 * @name removeFileWithConfig
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { removeFileWithConfig } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   removeFileWithConfig(
 *     { ...fs.removeFileConfig },
 *     'my-file.txt'
 *   )
 * )
 * ```
 */
export const removeFileWithConfigAndCancel = curry((cancel, options, fd) =>
  Future((bad, good) => {
    fs.rm(fd, options, err => (err ? bad(err) : good(fd)))
    return cancel
  })
)

export const removeFileWithConfig = removeFileWithConfigAndCancel(NO_OP)
export const DEFAULT_REMOVAL_CONFIG = {
  force: false,
  maxRetries: 0,
  recursive: false,
  retryDelay: 100,
  parallel: 10,
}

/**
 * Remove a file, default config
 * @name removeFile
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { removeFile } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   removeFile(
 *     'my-file.txt'
 *   )
 * )
 * ```
 */
export const removeFile = removeFileWithConfig(DEFAULT_REMOVAL_CONFIG)

/**
 * Remove multiple files, configurably
 * @name removeFilesWithConfig
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { removeFilesWithConfig } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   removeFilesWithConfig(
 *     { parallel: 30 },
 *     [...list, ...of, ...thirty, ...files]
 *   )
 * )
 * ```
 */
export const removeFilesWithConfigAndCancel = curry((cancel, conf, list) =>
  pipe(
    map(removeFileWithConfigAndCancel(cancel, without(['parallel'], conf))),
    parallel(propOr(10, 'parallel', conf))
  )(list)
)
export const removeFilesWithConfig = removeFilesWithConfigAndCancel(NO_OP)

/**
 * Remove multiple files, sans configuration
 * @name removeFiles
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { removeFiles } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   removeFiles(
 *     [...list, ...of, ...files]
 *   )
 * )
 * ```
 */
export const removeFiles = removeFilesWithConfig(DEFAULT_REMOVAL_CONFIG)

/**
 * Make a directory, but futuristically
 * @name mkdir
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { mkdir } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   mkdir(
 *     {},
 *     'my-dir'
 *   )
 * )
 * ```
 */
export const mkdir = curry((conf, x) =>
  Future((bad, good) => {
    fs.mkdir(x, conf, err => (err ? bad(err) : good(x)))
    return () => {}
  })
)

export const mkdirp = mkdir({ recursive: true })

export const access = curry((permissions, filePath) =>
  Future((bad, good) => {
    fs.access(filePath, permissions, err => (err ? bad(err) : good(true)))
    return () => {}
  })
)

export const exists = access(constants.F_OK)
export const readable = access(constants.R_OK)

export const directoryOnly = filePath =>
  filePath.slice(0, filePath.lastIndexOf('/'))

/**
 * Write a file to a nested folder and automatically create needed folders, akin to `mkdir -p`
 * @name writeFileWithAutoPath
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { writeFileWithAutoPath } from 'file-system'
 * // [...]
 * fork(console.warn)(console.log)(
 *   writeFileWithAutoPath(
 *     "folders/you/must/exist/file.biz",
 *     "my cool content"
 *   )
 * )
 * ```
 */
export const writeFileWithAutoPath = curry((filePath, content) =>
  pipe(
    directoryOnly,
    dir =>
      pipe(
        exists,
        chainRej(() => mkdirp(dir))
      )(dir),
    chain(() => writeFile(filePath, content))
  )(filePath)
)

export const rm = curry((conf, x) =>
  Future((bad, good) => {
    fs.rm(x, conf, err => (err ? bad(err) : good(x)))
    return () => {}
  })
)

export const rimraf = rm({ force: true, recursive: true })

export const ioWithCancel = curry(
  (cancel, fn, fd, buffer, offset, len, position) =>
    Future((bad, good) => {
      fn(fd, buffer, offset, len, position, (e, bytes, buff) =>
        e ? bad(e) : good(bytes, buff)
      )
      return cancel
    })
)

export const io = ioWithCancel(NO_OP)

export const read = io(fs.read)
export const write = io(fs.write)

export const findFile = curry((fn, def, x) =>
  pipe(
    map(pipe(fn, mapRej(F))),
    reduce((a, b) => (isFuture(a) ? race(a)(b) : b), def)
  )(x)
)

export const readAnyOr = curry((def, format, x) => findFile(readFile, def, x))

export const readAny = readAnyOr(null)

export const requireAnyOr = findFile(readable)
