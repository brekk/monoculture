// src/index.js
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
  forEach
} from "ramda";
import { trace } from "xtrace";
var assert = curry((check, issue) => {
  if (process.NODE_ENV === "production")
    return;
  if (!check) {
    throw new Error(issue);
  }
});
var internals = {};
var Sortable = class {
  constructor() {
    this._items = [];
    this.nodes = [];
  }
  add(nodes, options) {
    options = options ?? {};
    const before = [].concat(options.before ?? []);
    const after = [].concat(options.after ?? []);
    const group = options.group ?? "?";
    const sort = options.sort ?? 0;
    assert(!before.includes(group), `Item cannot come before itself: ${group}`);
    assert(!before.includes("?"), "Item cannot come before unassociated items");
    assert(!after.includes(group), `Item cannot come after itself: ${group}`);
    assert(!after.includes("?"), "Item cannot come after unassociated items");
    if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }
    for (const node of nodes) {
      const item = {
        seq: this._items.length,
        sort,
        before,
        after,
        group,
        node
      };
      this._items.push(item);
    }
    if (!options.manual) {
      const valid = this._sort();
      assert(
        valid,
        "item",
        group !== "?" ? `added into group ${group}` : "",
        "created a dependencies error"
      );
    }
    return this.nodes;
  }
  merge(others) {
    if (!Array.isArray(others)) {
      others = [others];
    }
    for (const other of others) {
      if (other) {
        for (const item of other._items) {
          this._items.push(Object.assign({}, item));
        }
      }
    }
    this._items.sort(internals.mergeSort);
    for (let i = 0; i < this._items.length; ++i) {
      this._items[i].seq = i;
    }
    const valid = this._sort();
    assert(valid, "merge created a dependencies error");
    return this.nodes;
  }
  sort() {
    const valid = this._sort();
    assert(valid, "sort created a dependencies error");
    return this.nodes;
  }
  _sort() {
    const graph = {};
    const graphAfters = /* @__PURE__ */ Object.create(null);
    const groups = /* @__PURE__ */ Object.create(null);
    for (const item of this._items) {
      const seq = item.seq;
      const group = item.group;
      groups[group] = groups[group] ?? [];
      groups[group].push(seq);
      graph[seq] = item.before;
      for (const after of item.after) {
        graphAfters[after] = graphAfters[after] ?? [];
        graphAfters[after].push(seq);
      }
    }
    for (const node in graph) {
      const expandedGroups = [];
      for (const graphNodeItem in graph[node]) {
        const group = graph[node][graphNodeItem];
        groups[group] = groups[group] ?? [];
        expandedGroups.push(...groups[group]);
      }
      graph[node] = expandedGroups;
    }
    for (const group in graphAfters) {
      if (groups[group]) {
        for (const node of groups[group]) {
          graph[node].push(...graphAfters[group]);
        }
      }
    }
    const ancestors = {};
    for (const node in graph) {
      const children = graph[node];
      for (const child of children) {
        ancestors[child] = ancestors[child] ?? [];
        ancestors[child].push(node);
      }
    }
    const visited = {};
    const sorted = [];
    for (let i = 0; i < this._items.length; ++i) {
      let next = i;
      if (ancestors[i]) {
        next = null;
        for (let j = 0; j < this._items.length; ++j) {
          if (visited[j] === true) {
            continue;
          }
          if (!ancestors[j]) {
            ancestors[j] = [];
          }
          const shouldSeeCount = ancestors[j].length;
          let seenCount = 0;
          for (let k = 0; k < shouldSeeCount; ++k) {
            if (visited[ancestors[j][k]]) {
              ++seenCount;
            }
          }
          if (seenCount === shouldSeeCount) {
            next = j;
            break;
          }
        }
      }
      if (next !== null) {
        visited[next] = true;
        sorted.push(next);
      }
    }
    if (sorted.length !== this._items.length) {
      return false;
    }
    const seqIndex = {};
    for (const item of this._items) {
      seqIndex[item.seq] = item;
    }
    this._items = [];
    this.nodes = [];
    for (const value of sorted) {
      const sortedItem = seqIndex[value];
      this.nodes.push(sortedItem.node);
      this._items.push(sortedItem);
    }
    return true;
  }
};
internals.mergeSort = (a, b) => {
  return a.sort === b.sort ? 0 : a.sort < b.sort ? -1 : 1;
};
var makeSortable = () => {
  return new Sortable();
};
var isArray = Array.isArray;
var autobox = unless(isArray, (x) => [x]);
var pushInto = curry((arr, x) => {
  arr.push(x);
  return arr;
});
var pushManyInto = curry((arr, x) => {
  arr.push(...x);
  return arr;
});
var _add = ({ items: _items, nodes: _nodes }, nodes, options = {}) => {
  nodes = autobox(nodes);
  const {
    before: _before = [],
    after: _after = [],
    group = "?",
    sort = 0
  } = options;
  const [before, after] = map(autobox)([_before, _after]);
  assert(!before.includes(group), `Item cannot come before itself: ${group}`);
  assert(!after.includes(group), `Item cannot come after itself: ${group}`);
  assert(!before.includes("?"), "Item cannot come before unassociated items");
  assert(!after.includes("?"), "Item cannot come after unassociated items");
  forEach(
    pipe(
      objOf("node"),
      mergeRight({
        seq: _items.length,
        sort,
        before,
        after,
        group
      }),
      pushInto(_items)
    ),
    nodes
  );
  return _nodes;
};
var generateGroups = curry(
  (context, _items) => reduce(
    (agg, { seq, group, before, after }) => {
      const { graph, groups, graphAfters } = context;
      groups[group] = groups[group] ?? [];
      groups[group].push(seq);
      graph[seq] = before;
      forEach((a) => {
        graphAfters[a] = graphAfters[a] ?? [];
        graphAfters[a].push(seq);
      }, after);
      return { graph, groups, graphAfters };
    },
    context,
    _items
  )
);
var unit = () => /* @__PURE__ */ Object.create(null);
var expandGroups = (context) => {
  const { groups, graph } = context;
  const expanded = [];
  const addToExpanded = pushManyInto(expanded);
  const out = pipe(
    toPairs,
    map(
      ([node, list]) => pipe(
        map((group) => {
          groups[group] = groups[group] ?? [];
          addToExpanded(groups[group]);
          return [group, groups[group]];
        })
      )(list)
    )
  )(graph);
  console.log(JSON.stringify(out, null, 2));
};
var _sort = (_items) => {
  console.log("...", _items);
  const context = {
    graph: {},
    graphAfters: unit(),
    groups: unit()
  };
  const groupedContext = generateGroups(context, _items);
  const { graph, graphAfters, groups } = groupedContext;
  const update = expandGroups(groupedContext);
  console.log("GRAPH", graph);
  for (const node in graph) {
    console.log("NODE", node);
    const expandedGroups = [];
    for (const graphNodeItem in graph[node]) {
      console.log("graphNodeItem", graphNodeItem);
      const group = graph[node][graphNodeItem];
      console.log({ group });
      groups[group] = groups[group] ?? [];
      expandedGroups.push(...groups[group]);
    }
    graph[node] = expandedGroups;
  }
  console.log(222, { groups, graph, graphAfters });
  for (const group in graphAfters) {
    if (groups[group]) {
      for (const node of groups[group]) {
        graph[node].push(...graphAfters[group]);
      }
    }
  }
  console.log(333, { groups, graph, graphAfters });
  const ancestors = {};
  for (const node in graph) {
    const children = graph[node];
    for (const child of children) {
      ancestors[child] = ancestors[child] ?? [];
      ancestors[child].push(node);
    }
  }
  console.log(444, ancestors);
  const visited = {};
  const sorted = [];
  for (let i = 0; i < _items.length; ++i) {
    let next = i;
    if (ancestors[i]) {
      next = null;
      for (let j = 0; j < _items.length; ++j) {
        if (visited[j] === true) {
          continue;
        }
        if (!ancestors[j]) {
          ancestors[j] = [];
        }
        const shouldSeeCount = ancestors[j].length;
        let seenCount = 0;
        for (let k = 0; k < shouldSeeCount; ++k) {
          if (visited[ancestors[j][k]]) {
            ++seenCount;
          }
        }
        if (seenCount === shouldSeeCount) {
          next = j;
          break;
        }
      }
    }
    if (next !== null) {
      visited[next] = true;
      sorted.push(next);
    }
  }
  console.log(555, sorted);
  if (sorted.length !== _items.length) {
    return false;
  }
  const seqIndex = {};
  for (const item of _items) {
    seqIndex[item.seq] = item;
  }
  console.log(666, seqIndex);
  _items = [];
  const nodes = [];
  for (const value of sorted) {
    const sortedItem = seqIndex[value];
    nodes.push(sortedItem.node);
    _items.push(sortedItem);
  }
  return nodes;
};
var makeSortable2 = () => {
  let items = [];
  const nodes = [];
  return {
    add: (_n, _o) => {
      const added = _add({ items, nodes }, _n, _o);
      items = items.concat(added);
    },
    sort: () => _sort(items)
  };
};
export {
  _add,
  _sort,
  assert,
  generateGroups,
  makeSortable,
  makeSortable2
};
