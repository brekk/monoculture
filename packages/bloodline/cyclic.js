import { reduce, map, toPairs, filter, any, includes, pipe, curry } from 'ramda'

export const checkCyclicWithCancel = curry(
  function _checkCyclicWithCancel(cancel, treeF) {
    return pipe(map(() => {}))(treeF)
  }
)

export const circularGraph = curry(
  function _circularGraph(cancel, treeF, objXXX) {
    // ostensibly this couldn't be a future
    const deps = checkCyclicWithCancel(cancel, treeF)
    return pipe(
      toPairs,
      filter(([k]) => any(includes(k), deps)),
      reduce((agg, [k, v]) => {
        const vv = filter(x => any(includes(x), deps), v)
        return { ...agg, [k]: vv }
      }, {})
    )(objXXX)
  }
)
