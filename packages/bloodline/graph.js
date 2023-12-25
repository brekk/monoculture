import { always as K, pipe, curry } from 'ramda'
import { execWithCancel } from 'kiddo'
import { coalesce } from 'fluture'
import { join as sysPathJoin } from 'node:path'

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
export const checkForGraphvizWithCancel = curry((cancel, pathToLook) =>
  pipe(
    execWithCancel(
      cancel,
      pathToLook ? sysPathJoin(pathToLook, 'gvpr') : 'gvpr'
    ),
    coalesce(K(false))(K(true))
  )(['-V'])
)
export const checkForGraphvizAtPath = checkForGraphvizWithCancel(() => {})
export const checkForGraphviz = () => checkForGraphvizAtPath('')
