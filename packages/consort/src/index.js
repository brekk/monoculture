import { of, curry, pipe, reduce } from 'ramda'
import { callWithScopeWhen, callBinaryWithScopeWhen } from 'xtrace'

const world = construct(Map)
const crew = construct(Set)
const ghostCrew = crew(null)

const hasOr = curry((def, x) => {
  x.has(def) || x.set(def, ghostCrew())
  return x
})

/*
export function makeOutgoingEdges(arr){
  return arr.reduce((edges, [from, to]) => {
    edges.has(from) || edges.set(from, new Set())
    edges.has(to) || edges.set(to, new Set())
    edges.get(from).add(to)
    return edges
  }, new Map())
}
*/
const edgeEffect = curry((step, x) =>
  reduce(
    (edges, [from, to]) =>
      pipe(hasOr(from), hasOr(to), e => {
        step([from, to], e)
        return e
      })(edges),
    world(),
    x
  )
)

const edgesOutgoing = edgeEffect(([from, to], e) => e.get(from).add(to))
const edgesIncoming = edgeEffect(([from, to], e) => e.get(to).add(from))
/*
const startNodes = pipe(
  edgesIncoming,
  addIndex(forEach)((v, k) => !v.size && 

  },[])
  */
