import { toPairs, reduce, map, identity as I, pipe } from 'ramda'
import { trace } from 'xtrace'

const graph = {
  task1: ['task2', 'task3'],
  task2: ['task3'],
  task3: [],
}

function getInDegree(_graph) {
  console.log({ INPUT: _graph })
  // Creating a map to store in-degrees of all vertices
  const inDegree = {}

  for (const key in _graph) {
    for (const indeg of _graph[key]) {
      console.log('...paper trail', { key, indeg, grill: _graph[key] })
      console.log('iter@@@@@', inDegree)
      // Traverse the _graph and fill in-degrees. Since complete _graph has keys
      // with no in-degrees, add them as nodes with 0 in-degrees
      inDegree[indeg] = inDegree[indeg] === undefined ? 1 : ++inDegree[indeg]
      console.log('...indeg', inDegree[indeg])
      inDegree[key] = inDegree[key] || 0
      console.log('...key', inDegree[key])
    }
  }

  console.log({ OUTPUT: inDegree })
  return inDegree
}

getInDegree(graph)

const run = pipe(
  trace('*INPUT*'),
  toPairs,
  reduce(
    (agg, [key, v]) =>
      pipe(
        map(
          indeg => pipe()()
          ///////////////
        )
      )(agg),
    {}
  ),
  trace('*OUTPUT*')
)
run(graph)
