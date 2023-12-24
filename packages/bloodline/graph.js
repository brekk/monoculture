import { always as K, pipe, curry } from 'ramda'
import { execWithCancel } from 'file-system'
import { coalesce } from 'fluture'
import { join as sysPathJoin } from 'node:path'

//
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
