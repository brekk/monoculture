import { pipe, curry, prop, ifElse, propOr, __ as $ } from 'ramda'
import { execa } from 'execa'
import { Future } from 'fluture'

export const didFail = propOr(true, 'failed')
export const fail = prop('stderr')
/* eslint-disable max-len */
/**
 * @pageSummary Call external processes and consume them as a Future-wrapped value.
 * This is a light wrapper around `execa`, so please see [execa](https://github.com/sindresorhus/execa)'s documentation for more info.
 */

/* eslint-disable jsdoc/tag-lines */
/**
 * Consume external commands as a Future-wrapped value.
 * @curried
 *  1. execWithConfig - Passes all possible configuration values plus a cancellation function.
 *
 *     @example
 *     ```js
 *     import { execWithConfig } from 'file-system'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       execWithConfig(
 *         function customCancellationFunction() {},
 *         'echo',
 *         { cleanup: true },
 *         ['ahoy']
 *       )
 *     )
 *     ```
 *
 *  2. execWithCancel - Eschews any configuration and instead only expects a cancellation function, command and arguments.
 *
 *     @example
 *     ```js
 *     import { execWithCancel } from 'file-system'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       execWithCancel(
 *         function customCancellationFunction() {},
 *         'echo',
 *         ['ahoy']
 *       )
 *     )
 *     ```
 *  3. exec - Eschews any configuration or cancellation function. Needs only command and arguments.
 *
 *     @example
 *     ```js
 *     import { exec } from 'file-system'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       exec(
 *         'echo',
 *         ['ahoy']
 *       )
 *     )
 *     ```
 */
/* eslint-enable max-len */
export const execWithConfig = curry(
  (cancellation, cmd, opts, args) =>
    new Future((bad, good) => {
      execa(cmd, args, opts)
        .catch(pipe(fail, bad))
        .then(ifElse(didFail, pipe(fail, bad), good))
      return cancellation
    })
)
export const execWithCancel = execWithConfig($, $, undefined)
export const exec = execWithCancel(() => {})
