import { Future } from 'fluture'
import { curry } from 'ramda'
import { envtrace } from 'envtrace'

const log = envtrace('water-wheel')

export const makeRemovableListener = curry((stream, key, fn) => {
  stream.on(key, fn)
  log('listening to', key)
  return () => {
    stream.removeListener(key, fn)
    log('stopped listening to', key)
  }
})

export const waterWheel = curry((cancel, $stream) =>
  Future((bad, good) => {
    const value = []
    if (!$stream.readable) {
      good(value)
      return cancel
    }
    const onData = x => {
      log('data', x)
      value.push(x)
    }
    const onEndOrError = err => {
      log('stopping', err ? `😰 ${err}` : `😎`)
      if (err) {
        bad(err)
      } else {
        good(value)
      }
      clean()
    }
    const onClose = x => {
      log('closing 😎', value)
      good(value)
      clean()
    }
    const streamKill = makeRemovableListener($stream)
    const killData = streamKill('data', onData)
    const killEnd = streamKill('end', onEndOrError)
    const killError = streamKill('error', onEndOrError)
    const killClose = streamKill('close', onClose)
    function clean() {
      killData()
      killError()
      killEnd()
      killClose()
    }
    return cancel
  })
)
