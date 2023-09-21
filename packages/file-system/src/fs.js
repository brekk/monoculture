import {
  rm as __rm,
  mkdir as __mkdir,
  readFile as __readFile,
  writeFile as __writeFile,
  access as __access,
  constants,
} from 'node:fs'
import { propOr, without, curry, pipe, map } from 'ramda'
import { chain, chainRej, Future, parallel } from 'fluture'
import glob from 'glob'

/**
 * make a file string relative
 * @name localize
 * @example
 * ```js
 * import { localize } from 'file-system'
 * console.log(`support localize('business')`)
 * ```
 */
export const localize = z => `./${z}`

/**
 * read a file asynchronously and future wrapped
 * @name readFile
 * @example
 * ```js
 * import { fork } from 'fluture'
 * import { readFile } from 'file-system'
 * fork(console.warn)(console.log)(readFile('./README.md'))
 * ```
 */
export const readFile = x =>
  new Future((bad, good) => {
    __readFile(x, 'utf8', (err, data) => (err ? bad(err) : good(data)))
    return () => {}
  })

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
export const readJSONFile = pipe(readFile, map(JSON.parse))

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
export const readDirWithConfig = curry(
  (conf, g) =>
    new Future((bad, good) => {
      try {
        glob(g, conf, (e, x) =>
          // thus far I cannot seem to ever call `bad` from within here
          e ? bad(e) : good(x)
        )
      } catch (e) {
        bad(e)
      }
      return () => {}
    })
)

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
export const writeFileWithConfig = curry(
  (conf, file, content) =>
    new Future((bad, good) => {
      __writeFile(file, content, conf, e => {
        if (e) {
          bad(e)
          return
        }
        good(content)
      })
      return () => {}
    })
)

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
export const removeFileWithConfig = curry(
  (options, fd) =>
    new Future((bad, good) => {
      __rm(fd, options, err => (err ? bad(err) : good(fd)))
      return () => {}
    })
)
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
export const removeFilesWithConfig = curry((conf, list) =>
  pipe(
    map(removeFileWithConfig(without(['parallel'], conf))),
    parallel(propOr(10, 'parallel', conf))
  )(list)
)

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
export const mkdir = curry(
  (conf, x) =>
    new Future((bad, good) => {
      __mkdir(x, conf, err => (err ? bad(err) : good(x)))
      return () => {}
    })
)

export const mkdirp = mkdir({ recursive: true })

export const access = curry(
  (permissions, filePath) =>
    new Future((bad, good) => {
      __access(filePath, permissions, err => (err ? bad(err) : good(true)))
      return () => {}
    })
)

export const exists = access(constants.F_OK)

export const directoryOnly = filePath =>
  filePath.slice(0, filePath.lastIndexOf('/'))

/**
 * Write a file to a nested folder and automatically create needed folders
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

export const rm = curry(
  (conf, x) =>
    new Future((bad, good) => {
      __rm(x, conf, err => (err ? bad(err) : good(x)))
      return () => {}
    })
)

export const rimraf = rm({ force: true, recursive: true })
