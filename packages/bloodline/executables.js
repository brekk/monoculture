import {
  keys,
  length,
  equals,
  always as K,
  pipe,
  filter,
  identity as I,
  isEmpty,
  map,
  toPairs,
  complement,
  curry,
} from 'ramda'
import { execWithCancel } from 'kiddo'
import { bimap, parallel } from 'fluture'
import { join as sysPathJoin } from 'node:path'
import { log } from './log'

/* eslint-disable max-len */

/**
 * Check for the existence of `gvpr`.
 * @curried
 *
 * 1. checkForGraphvizWithCancel - Provide a cancellation function and a path to look for `gvpr` within.
 *
 *    @example
 *    ```js
 *    import { checkForGraphvizWithCancel } from 'bloodline'
 *    import { fork } from 'fluture'
 *    fork(console.warn)(console.log)(
 *      checkForGraphvizWithCancel(
 *        cancellationFn,
 *        '/opt/homebrew/bin'
 *      )
 *    )
 *
 * 2. checkForGraphvizAtPath - Provide a path to look for `gvpr` in.
 *
 *    @example
 *    ```js
 *    import { checkForGraphvizAtPath } from 'bloodline'
 *    import { fork } from 'fluture'
 *    fork(console.warn)(console.log)(
 *      checkForGraphvizAtPath(
 *        '/opt/homebrew/bin'
 *      )
 *    )
 *    ```
 *
 * 3. checkForGraphviz - Check for graphviz, assuming it is already within your path.
 *
 *    @example
 *    ```js
 *    import { checkForGraphviz } from 'bloodline'
 *    import { fork } from 'fluture'
 *    fork(console.warn)(console.log)(
 *      checkForGraphvizWithCancel(
 *      )
 *    )
 *    ```
 */
/* eslint-enable max-len */
export const checkForBinaryWithCancel = curry(
  (cancel, binary, args, pathToLook) =>
    pipe(
      execWithCancel(
        cancel,
        pathToLook ? sysPathJoin(pathToLook, binary) : binary
      ),
      bimap(K(false))(K(true))
    )(args)
)
export const checkForGraphvizWithCancel = checkForBinaryWithCancel('gvpr')
export const checkForDot = checkForBinaryWithCancel('dot')
export const checkForBinaries = curry((cancel, basePath, keyed) => {
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
})
// export const checkForGraphvizAtPath = checkForGraphvizWithCancel(() => {})
// export const checkForGraphviz = () => checkForGraphvizAtPath('')
