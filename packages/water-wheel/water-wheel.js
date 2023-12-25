import { Future } from 'fluture'
import { curry } from 'ramda'

export const makeRemovableListener = curry((stream, key, fn) => {
  stream.on(key, fn)
  return () => stream.removeListener(key, fn)
})

export const waterWheel = curry((cancel, $stream) =>
  Future((bad, good) => {
    const runner = () => {
      const value = []
      if (!$stream.readable) {
        good(value)
        return
      }
      const onData = value.push
      const onEndOrError = err => {
        if (err) {
          bad(err)
        } else {
          good(value)
        }
        clean()
      }
      const onClose = x => {
        good(x)
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
    }
    runner()
    return cancel
  })
)
