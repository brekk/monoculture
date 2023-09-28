#!/usr/bin/env node

// src/async.js
import { Future } from "fluture";
import { curry } from "ramda";
var cancellableTask = curry((cancel, fn, args) => {
  return Future((bad, good) => {
    try {
      const value = fn(...args);
      good(value);
    } catch (e) {
      bad(e);
    }
    return cancel;
  });
});
var cancelSilently = () => {
};
var unaryWithCancel = curry(
  (cancel, fn, x) => cancellableTask(cancel, fn, [x])
);
var unary = unaryWithCancel(cancelSilently);
var binaryWithCancel = curry(
  (cancel, fn, x, y) => cancellableTask(cancel, fn, [x, y])
);
var binary = binaryWithCancel(cancelSilently);
var tertiaryWithCancel = curry(
  (cancel, fn, x, y, z) => cancellableTask(cancel, fn, [x, y, z])
);
var tertiary = tertiaryWithCancel(cancelSilently);

// src/list.js
import { curry as curry2 } from "ramda";
var insertAfter = curry2((idx, x, arr) => [
  ...arr.slice(0, idx + 1),
  x,
  ...arr.slice(idx + 1, Infinity)
]);

// src/runner.js
import {
  pathOr,
  curry as curry4,
  fromPairs,
  identity as I,
  map as map2,
  mergeRight,
  pipe as pipe2,
  prop,
  reduce as reduce2
} from "ramda";
import { pap, resolve } from "fluture";

// src/sort.js
import {
  curry as curry3,
  reject,
  reduce,
  pipe,
  map,
  findIndex,
  propEq,
  last
} from "ramda";
var without = curry3((name, x) => reject(propEq("name", name), x));
var topologicalDependencySort = (raw) => reduce(
  (agg, plugin) => {
    const { name, dependencies = [] } = plugin;
    const cleaned = without(name, agg);
    return pipe(
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
  (context, plugins) => pipe2(
    topologicalDependencySort,
    reduce2(
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
  (state, { selector = I, preserveLine = false, fn }, file) => {
    const selected = selector(state);
    const output = preserveLine ? {
      ...file,
      body: map2(([k, v]) => [k, fn(selected, v)])(file.body)
    } : fn(selected, file);
    return output;
  }
);
var processRelativeToFile = curry4(
  (state, plugin, files) => reduce2(
    (agg, __file) => {
      const { hash } = __file;
      return [...agg, [hash, stepFunction(state, plugin, __file)]];
    },
    [],
    files
  )
);
var fileProcessor = curry4(
  (context, plugins, files) => pipe2(
    topologicalDependencySort,
    reduce2(
      ({ state, events }, plugin) => {
        const { store = I, name } = plugin;
        const outcome = processRelativeToFile(state, plugin, files);
        const newState = { ...state, [name]: outcome };
        return {
          events: [...events, name],
          state: store(newState)
        };
      },
      { state: context, events: [] }
    ),
    mergeRight({
      hashMap: pipe2(
        map2((x) => [prop("hash", x), prop("file", x)]),
        fromPairs
      )(files)
    })
  )(plugins)
);
var futureApplicator = curry4((context, plugins, files) => ({
  state: pipe2(
    map2(({ default: plugin }) => [
      plugin.name,
      pipe2(
        map2((file) => [file.hash, stepFunction(context, plugin, file)]),
        fromPairs
      )(files)
    ]),
    fromPairs
  )(plugins),
  files,
  hashes: pipe2(
    map2((z) => [prop("hash", z), prop("file", z)]),
    fromPairs
  )(files),
  plugins: map2(pathOr("???", ["default", "name"]), plugins)
}));
var futureFileProcessor = curry4(
  (context, pluginsF, filesF) => pipe2(
    pap(map2(topologicalDependencySort, pluginsF)),
    pap(filesF)
  )(resolve(futureApplicator(context)))
);

// src/validate.js
import {
  of,
  ap,
  without as without2,
  all,
  applySpec,
  curry as curry5,
  equals,
  keys,
  pipe as pipe3,
  propOr,
  reduce as reduce3,
  reject as reject2,
  values
} from "ramda";
var kindIs = curry5((expected, x) => equals(expected, typeof x));
var coerce = (x) => !!x;
var PLUGIN_SHAPE = {
  // unique identifier for the plugin
  name: pipe3(propOr(false, "name"), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe3(propOr(false, "fn"), kindIs("function")),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe3(
    propOr(() => {
    }, "selector"),
    kindIs("function")
  ),
  preserveOffset: (x) => {
    const { preserveOffset: p = true } = x;
    return kindIs("boolean", p);
  },
  preserveLine: (x) => {
    const { preserveLine: p = true } = x;
    return kindIs("boolean", p);
  },
  // store
  store: pipe3(
    propOr(() => {
    }, "store"),
    kindIs("function")
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe3(propOr([], "dependencies"), Array.isArray)
};
var EXPECTED_KEYS = keys(PLUGIN_SHAPE);
var noExtraKeys = (x) => pipe3(
  keys,
  without2(EXPECTED_KEYS),
  (y) => y.length ? `Found additional or misspelled keys: [${y.join(", ")}]` : ``
)(x);
var testPlugin = pipe3(
  of,
  ap([applySpec(PLUGIN_SHAPE), noExtraKeys]),
  ([x, error]) => error ? { ...x, error } : x
);
var checkPlugin = pipe3(testPlugin, values, all(equals(true)));
var validatePlugins = reduce3((agg, plugin) => {
  const check = checkPlugin(plugin);
  const name = propOr("unnamed", "name", plugin);
  if (!check) {
    const err = [name, pipe3(testPlugin, reject2(equals(true)), keys)(plugin)];
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
export {
  EXPECTED_KEYS,
  PLUGIN_SHAPE,
  binary,
  binaryWithCancel,
  cancelSilently,
  cancellableTask,
  checkPlugin,
  coerce,
  fileProcessor,
  futureApplicator,
  futureFileProcessor,
  insertAfter,
  kindIs,
  noExtraKeys,
  stepFunction,
  taskProcessor,
  tertiary,
  tertiaryWithCancel,
  testPlugin,
  topologicalDependencySort,
  unary,
  unaryWithCancel,
  validatePlugins,
  without
};
