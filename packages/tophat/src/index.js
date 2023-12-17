import {
  concat,
  values,
  objOf,
  mergeRight,
  __ as $,
  range,
  length,
  pipe,
  toPairs,
  reduce,
  unless,
  map,
  curry,
  forEach,
} from 'ramda'
import { trace } from 'xtrace'

export const assert = curry((check, issue) => {
  if (process.NODE_ENV === 'production') return
  if (!check) {
    throw new Error(issue)
  }
})

const internals = {}

class Sortable {
  constructor() {
    this._items = []
    this.nodes = []
  }

  add(nodes, options) {
    options = options ?? {}

    // Validate rules

    const before = [].concat(options.before ?? [])
    const after = [].concat(options.after ?? [])
    const group = options.group ?? '?'
    const sort = options.sort ?? 0 // Used for merging only

    assert(!before.includes(group), `Item cannot come before itself: ${group}`)
    assert(!before.includes('?'), 'Item cannot come before unassociated items')
    assert(!after.includes(group), `Item cannot come after itself: ${group}`)
    assert(!after.includes('?'), 'Item cannot come after unassociated items')

    if (!Array.isArray(nodes)) {
      nodes = [nodes]
    }

    for (const node of nodes) {
      const item = {
        seq: this._items.length,
        sort,
        before,
        after,
        group,
        node,
      }

      this._items.push(item)
    }

    // Insert event

    if (!options.manual) {
      const valid = this._sort()
      assert(
        valid,
        'item',
        group !== '?' ? `added into group ${group}` : '',
        'created a dependencies error'
      )
    }

    return this.nodes
  }

  merge(others) {
    if (!Array.isArray(others)) {
      others = [others]
    }

    for (const other of others) {
      if (other) {
        for (const item of other._items) {
          this._items.push(Object.assign({}, item)) // Shallow cloned
        }
      }
    }

    // Sort items

    this._items.sort(internals.mergeSort)
    for (let i = 0; i < this._items.length; ++i) {
      this._items[i].seq = i
    }

    const valid = this._sort()
    assert(valid, 'merge created a dependencies error')

    return this.nodes
  }

  sort() {
    const valid = this._sort()
    assert(valid, 'sort created a dependencies error')

    return this.nodes
  }

  _sort() {
    // Construct graph

    const graph = {}
    const graphAfters = Object.create(null) // A prototype can bungle lookups w/ false positives
    const groups = Object.create(null)

    for (const item of this._items) {
      const seq = item.seq // Unique across all items
      const group = item.group

      // Determine Groups

      groups[group] = groups[group] ?? []
      groups[group].push(seq)

      // Build intermediary graph using 'before'

      graph[seq] = item.before

      // Build second intermediary graph with 'after'

      for (const after of item.after) {
        graphAfters[after] = graphAfters[after] ?? []
        graphAfters[after].push(seq)
      }
    }

    // Expand intermediary graph

    for (const node in graph) {
      const expandedGroups = []

      for (const graphNodeItem in graph[node]) {
        const group = graph[node][graphNodeItem]
        groups[group] = groups[group] ?? []
        expandedGroups.push(...groups[group])
      }

      graph[node] = expandedGroups
    }

    // Merge intermediary graph using graphAfters into final graph

    for (const group in graphAfters) {
      if (groups[group]) {
        for (const node of groups[group]) {
          graph[node].push(...graphAfters[group])
        }
      }
    }

    // Compile ancestors

    const ancestors = {}
    for (const node in graph) {
      const children = graph[node]
      for (const child of children) {
        ancestors[child] = ancestors[child] ?? []
        ancestors[child].push(node)
      }
    }

    // Topo sort

    const visited = {}
    const sorted = []

    for (let i = 0; i < this._items.length; ++i) {
      // Looping through item.seq values out of order
      let next = i

      if (ancestors[i]) {
        next = null
        for (let j = 0; j < this._items.length; ++j) {
          // As above, these are item.seq values
          if (visited[j] === true) {
            continue
          }

          if (!ancestors[j]) {
            ancestors[j] = []
          }

          const shouldSeeCount = ancestors[j].length
          let seenCount = 0
          for (let k = 0; k < shouldSeeCount; ++k) {
            if (visited[ancestors[j][k]]) {
              ++seenCount
            }
          }

          if (seenCount === shouldSeeCount) {
            next = j
            break
          }
        }
      }

      if (next !== null) {
        visited[next] = true
        sorted.push(next)
      }
    }

    if (sorted.length !== this._items.length) {
      return false
    }

    const seqIndex = {}
    for (const item of this._items) {
      seqIndex[item.seq] = item
    }

    this._items = []
    this.nodes = []

    for (const value of sorted) {
      const sortedItem = seqIndex[value]
      this.nodes.push(sortedItem.node)
      this._items.push(sortedItem)
    }

    return true
  }
}

internals.mergeSort = (a, b) => {
  return a.sort === b.sort ? 0 : a.sort < b.sort ? -1 : 1
}

export const makeSortable = () => {
  return new Sortable()
}

const isArray = Array.isArray
const autobox = unless(isArray, x => [x])

export const _add = (context, nodes, options = {}) => {
  const { items: _items, nodes: _nodes } = context
  nodes = autobox(nodes)
  const {
    before: _before = [],
    after: _after = [],
    group = '?',
    sort = 0,
  } = options
  const [before, after] = map(autobox)([_before, _after])
  assert(!before.includes(group), `Item cannot come before itself: ${group}`)
  assert(!after.includes(group), `Item cannot come after itself: ${group}`)
  assert(!before.includes('?'), 'Item cannot come before unassociated items')
  assert(!after.includes('?'), 'Item cannot come after unassociated items')
  const itemsToAdd = map(
    pipe(
      objOf('node'),
      mergeRight({
        seq: _items.length,
        sort,
        before,
        after,
        group,
      })
    ),
    nodes
  )
  // this mutation should be eschewed
  context.items = concat(_items, itemsToAdd)
  return _nodes
}

const generateGroups = curry((context, _items) =>
  reduce(
    (agg, { seq, group, before, after }) => {
      const { graph, groups, graphAfters } = context
      groups[group] = groups[group] ?? []
      groups[group].push(seq)
      graph[seq] = before
      forEach(a => {
        graphAfters[a] = graphAfters[a] ?? []
        graphAfters[a].push(seq)
      }, after)
      return { graph, groups, graphAfters }
    },
    context,
    _items
  )
)

const unit = () => Object.create(null)

export const _sort = _items => {
  console.log('...', _items)

  const graph = {}
  const graphAfters = unit()
  const groups = unit()
  // const { graph, graphAfters, groups } = context

  // const { graph, graphAfters, groups } = generateGroups(context, _items)

  forEach(({ seq, group, before, after }) => {
    // Determine Groups

    groups[group] = groups[group] ?? []
    groups[group].push(seq)

    // Build intermediary graph using 'before'

    graph[seq] = before

    // Build second intermediary graph with 'after'

    forEach(a => {
      graphAfters[a] = graphAfters[a] ?? []
      graphAfters[a].push(seq)
    }, after)
  }, _items)
  console.log('GRAPH', graph)

  // Expand intermediary graph

  /*
  for (const node in graph) {
    console.log('NODE', node)
    const expandedGroups = []

    for (const graphNodeItem in graph[node]) {
      console.log('graphNodeItem', graphNodeItem)
      const group = graph[node][graphNodeItem]
      console.log({ group })
      groups[group] = groups[group] ?? []
      expandedGroups.push(...groups[group])
    }

    graph[node] = expandedGroups
  }
  */
  for (const node in graph) {
    console.log('NODE', node)
    const expandedGroups = []

    for (const graphNodeItem in graph[node]) {
      console.log('graphNodeItem', graphNodeItem)
      const group = graph[node][graphNodeItem]
      console.log({ group })
      groups[group] = groups[group] ?? []
      expandedGroups.push(...groups[group])
    }

    graph[node] = expandedGroups
  }
  console.log(222, { groups, graph, graphAfters })

  // Merge intermediary graph using graphAfters into final graph

  for (const group in graphAfters) {
    if (groups[group]) {
      for (const node of groups[group]) {
        graph[node].push(...graphAfters[group])
      }
    }
  }

  console.log(333, { groups, graph, graphAfters })
  // Compile ancestors

  const ancestors = {}
  for (const node in graph) {
    const children = graph[node]
    for (const child of children) {
      ancestors[child] = ancestors[child] ?? []
      ancestors[child].push(node)
    }
  }
  console.log(444, ancestors)
  // Topo sort

  const visited = {}
  const sorted = []

  for (let i = 0; i < _items.length; ++i) {
    // Looping through item.seq values out of order
    let next = i

    if (ancestors[i]) {
      next = null
      for (let j = 0; j < _items.length; ++j) {
        // As above, these are item.seq values
        if (visited[j] === true) {
          continue
        }

        if (!ancestors[j]) {
          ancestors[j] = []
        }

        const shouldSeeCount = ancestors[j].length
        let seenCount = 0
        for (let k = 0; k < shouldSeeCount; ++k) {
          if (visited[ancestors[j][k]]) {
            ++seenCount
          }
        }

        if (seenCount === shouldSeeCount) {
          next = j
          break
        }
      }
    }

    if (next !== null) {
      visited[next] = true
      sorted.push(next)
    }
  }
  console.log(555, sorted)

  if (sorted.length !== _items.length) {
    return false
  }

  const seqIndex = {}
  for (const item of _items) {
    seqIndex[item.seq] = item
  }

  console.log(666, seqIndex)

  _items = []
  const nodes = []

  for (const value of sorted) {
    const sortedItem = seqIndex[value]
    nodes.push(sortedItem.node)
    _items.push(sortedItem)
  }

  return nodes
}

export const makeSortable2 = () => {
  let items = []
  const nodes = []
  return {
    add: (_n, _o) => {
      const added = _add({ items, nodes }, _n, _o)
      items = items.concat(added)
    },
    sort: () => _sort(items),
  }
}
