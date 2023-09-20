#!/usr/bin/env node

// src/validate.js
import {
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
var kindIs = curry((expected, x) => equals(expected, typeof x));
var coerce = (x) => !!x;
var testPlugin = applySpec({
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
  // store
  store: pipe(
    propOr(() => {
    }, "store"),
    kindIs("function")
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe(propOr([], "dependencies"), Array.isArray)
});
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
import { curry as curry4, pipe as pipe3, reduce as reduce3, identity as I } from "ramda";

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
var without = curry3((name, x) => reject2(propEq("name", name), x));
var topologicalDependencySort = (raw) => reduce2(
  (agg, plugin) => {
    const { name, dependencies = [] } = plugin;
    const cleaned = without(name, agg);
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
export {
  checkPlugin,
  coerce,
  insertAfter,
  kindIs,
  taskProcessor,
  testPlugin,
  topologicalDependencySort,
  validatePlugins,
  without
};
