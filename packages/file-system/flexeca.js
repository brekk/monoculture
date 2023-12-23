import { pipe, curry, prop, ifElse, propOr } from 'ramda'
import { execa } from 'execa'
import { Future } from 'fluture'

const didFail = propOr(true, 'failed')
const fail = prop('stderr')

export const flexecaWithOptionsAndCancel = curry(
  (cancellation, cmd, opts, args) =>
    new Future((bad, good) => {
      execa(cmd, args, opts)
        .catch(pipe(fail, bad))
        .then(ifElse(didFail, pipe(fail, bad), good))
      return cancellation
    })
)

export const flexecaWithCanceller = curry(
  (cancellation, cmd, args) =>
    new Future((bad, good) => {
      execa(cmd, args)
        .catch(pipe(fail, bad))
        .then(ifElse(didFail, pipe(fail, bad), good))
      return cancellation
    })
)

export const flexeca = flexecaWithCanceller(() => {})
