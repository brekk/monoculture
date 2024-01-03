import { pipe, curry, prop, ifElse, propOr, __ as $ } from 'ramda'
import { execa } from 'execa'
import { Future, promise } from 'fluture'
import { envtrace } from 'envtrace'
import { oraPromise } from 'ora'

const log = envtrace('kiddo')

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
 *     import { execWithConfig } from 'kiddo'
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
 *     import { execWithCancel } from 'kiddo'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       execWithCancel(
 *         function customCancellationFunction() {},
 *         'echo',
 *         ['ahoy']
 *       )
 *     )
 *     ```
 *
 *  3. exec - Eschews any configuration or cancellation function. Needs only command and arguments.
 *
 *     @example
 *     ```js
 *     import { exec } from 'kiddo'
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
  function _execWithConfig(cancellation, cmd, opts, args) {
    return new Future((bad, good) => {
      log('Running', `"${cmd} ${args.join(' ')}"`)
      execa(cmd, args, opts)
        .catch(pipe(fail, bad))
        .then(ifElse(didFail, pipe(fail, bad), good))
      return cancellation
    })
  }
)
export const execWithCancel = execWithConfig($, $, undefined)
export const exec = execWithCancel(() => {})

/**
 * Add an `ora` indicator to a Future
 * @name signal
 * @future
 * @exported
 * @example
 * ```js test=true
 * import { pipe, map } from 'ramda'
 * import { readFile } from 'file-system'
 * import { fork } from 'fluture'
 * // drgen-import-above
 * const cancel = () => {}
 * pipe(
 *   signal(cancel, { text: 'Reading file...', successText: 'Read file!'}),
 *   map(JSON.parse),
 *   fork(done)(raw => {
 *     expect(raw.name).toEqual('kiddo')
 *     done()
 *   })
 * )(readFile('./package.json'))
 * ```
 */
export const signal = curry(function _signal(cancel, options, f) {
  return Future(function _signalF(bad, good) {
    oraPromise(promise(f), options).catch(bad).then(good)
    return cancel
  })
})
