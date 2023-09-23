#!/usr/bin/env node

// src/validate.js
import {
  of,
  ap,
  without,
  all,
  applySpec,
  curry,
  equals,
  keys,
  pipe,
  propOr,
  reduce,
  reject,
  values
} from "ramda";
var trace = curry((a, b) => {
  console.log(a, b);
  return b;
});
var kindIs = curry((expected, x) => equals(expected, typeof x));
var coerce = (x) => !!x;
var PLUGIN_SHAPE = {
  // unique identifier for the plugin
  name: pipe(propOr(false, "name"), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe(propOr(false, "fn"), kindIs("function")),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe(
    propOr(() => {
    }, "selector"),
    kindIs("function")
  ),
  processLine: (x) => {
    const { processLine: p = true } = x;
    return kindIs("boolean", p);
  },
  // store
  store: pipe(
    propOr(() => {
    }, "store"),
    kindIs("function")
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe(propOr([], "dependencies"), Array.isArray)
};
var EXPECTED_KEYS = keys(PLUGIN_SHAPE);
var noExtraKeys = (x) => pipe(
  keys,
  without(EXPECTED_KEYS),
  (y) => y.length ? `Found additional or misspelled keys: [${y.join(", ")}]` : ``
)(x);
var testPlugin = pipe(
  of,
  ap([applySpec(PLUGIN_SHAPE), noExtraKeys]),
  ([x, error]) => error ? { ...x, error } : x
);
var checkPlugin = pipe(testPlugin, values, all(equals(true)));
var validatePlugins = reduce((agg, plugin) => {
  const check = checkPlugin(plugin);
  const name = propOr("unnamed", "name", plugin);
  if (!check) {
    const err = [name, pipe(testPlugin, reject(equals(true)), keys)(plugin)];
    return {
      ...agg,
      incorrect: agg.incorrect ? [...agg.incorrect, err] : [err]
    };
  }
  return {
    ...agg,
    correct: agg.correct ? [...agg.correct, name] : [name]
  };
}, {});

// src/list.js
import { curry as curry2 } from "ramda";
var insertAfter = curry2((idx, x, arr) => [
  ...arr.slice(0, idx + 1),
  x,
  ...arr.slice(idx + 1, Infinity)
]);

// src/runner.js
import {
  curry as curry4,
  pipe as pipe3,
  reduce as reduce3,
  identity as I,
  mergeRight,
  prop,
  map as map2,
  fromPairs
} from "ramda";

// src/sort.js
import {
  curry as curry3,
  reject as reject2,
  reduce as reduce2,
  pipe as pipe2,
  map,
  findIndex,
  propEq,
  last
} from "ramda";
var without2 = curry3((name, x) => reject2(propEq("name", name), x));
var topologicalDependencySort = (raw) => reduce2(
  (agg, plugin) => {
    const { name, dependencies = [] } = plugin;
    const cleaned = without2(name, agg);
    return pipe2(
      map((d) => findIndex(propEq("name", d), cleaned)),
      (z) => z.sort(),
      last,
      (ix = -1) => insertAfter(ix, plugin, cleaned)
    )(dependencies);
  },
  raw,
  raw
);

// src/runner.js
var taskProcessor = curry4(
  (context, plugins) => pipe3(
    topologicalDependencySort,
    reduce3(
      ({ state, events }, { name, fn, selector = I, store: __focus = false }) => {
        const store = __focus || I;
        const outcome = fn(selector(state));
        const newState = { ...state, [name]: outcome };
        return {
          events: [...events, [name, outcome]],
          state: __focus ? store(newState) : newState
        };
      },
      { state: context, events: [] }
    )
  )(plugins)
);
var stepFunction = curry4(
  (selected, { processLine, fn }, file) => processLine ? {
    ...file,
    body: map2(([k, v]) => [k, fn(selected, v)])(file.body)
  } : fn(selected, file)
);
var processRelativeToFile = curry4(
  (state, plugin, files) => reduce3(
    (agg, __file) => {
      const {
        name,
        fn,
        selector = I,
        store: __focus = false,
        processLine = false
      } = plugin;
      const selected = selector(state);
      const { hash } = __file;
      console.log("processLine", processLine, fn);
      return [...agg, [hash, stepFunction(selected, plugin, __file)]];
    },
    [],
    files
  )
);
var fileProcessor = curry4(
  (context, plugins, files) => pipe3(
    topologicalDependencySort,
    reduce3(
      ({ state, events }, plugin) => {
        const { store: __focus = false, name } = plugin;
        const store = __focus || I;
        const outcome = processRelativeToFile(state, plugin, files);
        const newState = { ...state, [name]: outcome };
        return {
          events: [...events, name],
          state: __focus ? store(newState) : newState
        };
      },
      { state: context, events: [] }
    ),
    mergeRight({
      hashMap: pipe3(
        map2((x) => [prop("hash", x), prop("file", x)]),
        fromPairs
      )(files)
    })
  )(plugins)
);
export {
  EXPECTED_KEYS,
  PLUGIN_SHAPE,
  checkPlugin,
  coerce,
  fileProcessor,
  insertAfter,
  kindIs,
  noExtraKeys,
  taskProcessor,
  testPlugin,
  topologicalDependencySort,
  trace,
  validatePlugins,
  without2 as without
};
