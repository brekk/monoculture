import {
  keys,
  length,
  equals,
  always as K,
  pipe,
  filter,
  identity as I,
  map,
  toPairs,
  curry,
} from 'ramda'
import { execWithCancel } from 'kiddo'
import { bimap, parallel } from 'fluture'
import { join as sysPathJoin } from 'node:path'
import { log } from './log'

/**
 * Check for the existence of a binary
 * @name checkForBinaryWithCancel
 * @example
 * ```js
 * import { checkForBinaryWithCancel } from 'bloodline'
 * import { fork } from 'fluture'
 * fork(console.warn)(console.log)(
 *   checkForBinaryWithCancel(
 *     cancellationFn,
 *     'gvpr',
 *     ['-V'],
 *     ''
 *   )
 * )
 * ```
 */
export const checkForBinaryWithCancel = curry(
  function _checkForBinaryWithCancel(cancel, binary, args, pathToLook) {
    return pipe(
      execWithCancel(
        cancel,
        pathToLook ? sysPathJoin(pathToLook, binary) : binary
      ),
      bimap(K(false))(K(true))
    )(args)
  }
)

/**
 * Check for multiple binaries in a single call
 * @name checkForBinaries
 * @example
 * ```js
 * import { checkForBinaries } from 'bloodline'
 * import { fork } from 'fluture'
 * fork(console.warn)(console.log)(
 *   checkForBinaries(
 *     cancellationFn,
 *     '/usr/bin',
 *     { gvpr: ['-V'], dot: ['-V'] }
 *   )
 * )
 * ```
 */
export const checkForBinaries = curry(
  function _checkForBinaries(cancel, basePath, keyed) {
    const keycount = pipe(keys, length)(keyed)
    return pipe(
      toPairs,
      map(([cmd, { binPath = basePath, args = [] }]) =>
        checkForBinaryWithCancel(cancel, cmd, args, binPath)
      ),
      parallel(10),
      map(pipe(filter(I), length, equals(keycount))),
      map(log.exe(`binaries`))
    )(keyed)
  }
)
