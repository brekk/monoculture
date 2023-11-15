import { getEdges, getIndegree, solve, autodepend } from './index'

describe('solve()', () => {
  it('should solve a valid graph', () => {
    const graph = {
      task3: ['task2', 'task1'],
      task4: ['task2', 'task1', 'task3'],
      task1: [],
      task2: ['task1'],
      task5: ['task4', 'task1', 'task3', 'task2'],
    }

    const solved = ['task1', 'task2', 'task3', 'task4', 'task5']

    expect(solve(graph)).toEqual(solved)
  })

  it('should solve a graph with missing keys', () => {
    const graph = {
      task1: ['task2'],
      task2: ['task3', 'task4', 'task5', 'task6', 'task7'],
    }

    const solved = [
      'task3',
      'task4',
      'task5',
      'task6',
      'task7',
      'task2',
      'task1',
    ]

    expect(solve(graph)).toEqual(solved)
  })

  it('should solve an empty graph', () => {
    expect(solve({})).toEqual([])
  })

  it('should throw an exception on circular dependency in graph', () => {
    const graph = {
      task1: ['task2'],
      task2: ['task1'],
    }
    expect(() => solve(graph)).toThrow(
      'There is a circular dependency in the graph'
    )
  })
})

describe('autodepend()', () => {
  it('should add missing keys to incomplete graph', () => {
    const graph = {
      task1: ['task2', 'task3'],
    }

    const output = {
      task1: ['task2', 'task3'],
      task2: [],
      task3: [],
    }

    expect(autodepend(graph)).toEqual(output)
  })

  it('should not alter complete graph', () => {
    const graph = {
      task1: ['task2', 'task3'],
      task2: [],
      task3: [],
    }

    expect(autodepend(graph)).toEqual(graph)
  })
})

describe('getEdges()', () => {
  it('should compute correct edges to a complete graph', () => {
    const graph = {
      task1: ['task2', 'task3'],
      task2: ['task3'],
      task3: [],
    }

    const solved = [
      ['task1', 'task2'],
      ['task1', 'task3'],
      ['task2', 'task3'],
    ]

    expect(getEdges(graph)).toEqual(solved)
  })

  it('should compute correct edges to an incomplete graph', () => {
    const graph = {
      task1: ['task2', 'task3', 'task4'],
      task2: ['task3'],
    }

    const solved = [
      ['task1', 'task2'],
      ['task1', 'task3'],
      ['task1', 'task4'],
      ['task2', 'task3'],
    ]

    expect(getEdges(graph)).toEqual(solved)
  })
})

function getInDegree(graph) {
  // Creating a map to store in-degrees of all vertices
  let inDegree = {}

  for (let key in graph) {
    for (let indeg of graph[key]) {
      // Traverse the graph and fill in-degrees. Since complete graph has keys
      // with no in-degrees, add them as nodes with 0 in-degrees
      inDegree[indeg] = inDegree[indeg] === undefined ? 1 : ++inDegree[indeg]
      inDegree[key] = inDegree[key] || 0
      console.log({ key, indeg, yo: inDegree[indeg], hey: inDegree[key] })
    }
  }

  return inDegree
}

describe('getIndegree()', () => {
  it('should compute correct in-degree for a complete graph', () => {
    const graph = {
      task1: ['task2', 'task3'],
      task2: ['task3'],
      task3: [],
    }

    const solved = {
      task1: 0,
      task2: 1,
      task3: 2,
    }

    expect(getIndegree(graph)).toEqual(solved)
  })

  it('should compute correct in-degree for an incomplete graph', () => {
    const graph = {
      task1: ['task2', 'task3'],
      task2: ['task3'],
    }

    const solved = {
      task1: 0,
      task2: 1,
      task3: 2,
    }

    expect(getIndegree(graph)).toEqual(solved)
  })
})
