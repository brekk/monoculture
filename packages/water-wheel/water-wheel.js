import { Future } from 'fluture'
import { __ as $, curry } from 'ramda'
import { getStreamAsArray } from 'get-stream'

export const waterWheelWithConfig = curry(
  function _waterWheelWithConfig(cancel, maxBuffer, x) {
    return Future((bad, good) => {
      getStreamAsArray(x, { maxBuffer }).catch(bad).then(good)
      return cancel
    })
  }
)
export const waterWheel = waterWheelWithConfig($, Infinity)
