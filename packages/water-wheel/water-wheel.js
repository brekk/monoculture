import { Future } from 'fluture'
import { __ as $, curry } from 'ramda'
import { getStreamAsArray } from 'get-stream'

export const waterWheelWithConfig = curry((cancel, maxBuffer, x) =>
  Future((bad, good) => {
    getStreamAsArray(x, { maxBuffer }).catch(bad).then(good)
    return cancel
  })
)
export const waterWheel = waterWheelWithConfig($, Infinity)
