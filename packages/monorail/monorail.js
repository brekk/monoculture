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
  curry as curry5,
  applySpec,
  fromPairs,
  identity as I,
  map as map3,
  mergeRight,
  pipe as pipe3,
  prop,
  reduce as reduce3
} from "ramda";
import { pap, resolve } from "fluture";

// src/helpers.js
import {
  length,
  lt,
  reduce,
  __ as $,
  ap,
  findLast,
  slice,
  defaultTo,
  map,
  filter,
  find,
  head,
  curry as curry3,
  propOr,
  any,
  pipe,
  last,
  test
} from "ramda";
import { trace } from "xtrace";
var bodyTest = curry3(
  (fn, file, needle) => pipe(propOr([], "body"), fn(pipe(last, test(needle))))(file)
);
var _any = bodyTest(any);
var onLines = curry3(
  (file, needle) => pipe(bodyTest(filter, file), map(head))(needle)
);
var onLine = curry3(
  (file, needle) => pipe(bodyTest(find, file), defaultTo([-1]), head)(needle)
);
var onLastLine = curry3(
  (file, needle) => pipe(bodyTest(findLast, file), defaultTo([-1]), head)(needle)
);
var selectBetween = curry3(
  (file, start, end) => pipe(
    (z) => [z],
    ap([onLine($, start), onLastLine($, end), propOr([], "body")]),
    ([a, z, body]) => a === -1 || z === -1 ? [] : filter(([line]) => a <= line && line <= z)(body)
  )(file)
);
var selectAll = curry3(
  (file, start, end) => pipe(
    propOr([], "body"),
    reduce(
      ({ active, all: all2, current }, [line, content]) => {
        const checkStart = test(start, content);
        const checkEnd = test(end, content);
        const stillActive = checkStart || active;
        if (stillActive) {
          if (checkEnd) {
            return {
              active: false,
              all: all2.concat([current.concat([line, content])]),
              current: []
            };
          }
          return {
            active: !checkEnd,
            all: all2,
            current: current.concat([line, content])
          };
        }
        return {
          active: false,
          all: all2.concat([current]),
          current: []
        };
      },
      { active: false, all: [], current: [] }
    ),
    propOr([], "all"),
    filter(pipe(length, lt(0)))
    // z => JSON.stringify(z, null, 2)
    // reduce((agg, [line, content]) =>
  )(file)
);
var _filter = bodyTest(filter);
var makeHelpers = (file) => ({
  any: _any(file),
  onLines: onLines(file),
  onLine: onLine(file),
  filter: _filter(file),
  between: selectBetween(file),
  selectAll: selectAll(file)
});

// src/sort.js
import {
  curry as curry4,
  reject,
  reduce as reduce2,
  pipe as pipe2,
  map as map2,
  findIndex,
  propEq,
  last as last2
} from "ramda";

// src/trace.js
import { complextrace } from "envtrace";
var log = complextrace("monorail", [
  "async",
  "validate",
  "sort",
  "route",
  "run"
]);

// src/sort.js
var without = curry4((name, x) => reject(propEq("name", name), x));
var topologicalDependencySort = (raw) => pipe2(
  map2((rawPlug) => rawPlug?.default ?? rawPlug),
  (defaulted) => reduce2(
    (agg, plugin) => {
      const { name, dependencies = [] } = plugin;
      const cleaned = without(name, agg);
      return pipe2(
        map2((d) => findIndex(propEq("name", d), cleaned)),
        (z) => z.sort(),
        last2,
        (ix = -1) => insertAfter(ix, plugin, cleaned)
      )(dependencies);
    },
    defaulted,
    defaulted
  )
)(raw);

// src/runner.js
var taskProcessor = curry5(
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
var stepFunction = curry5(
  (state, { name, selector = I, preserveLine = false, fn }, file) => {
    const selected = selector(state);
    const helpers = makeHelpers(file);
    const output = preserveLine ? {
      ...file,
      body: map3(([k, v]) => [k, fn(selected, v, helpers)])(file.body)
    } : fn(selected, file, helpers);
    return output;
  }
);
var processRelativeToFile = curry5(
  (state, plugin, files) => reduce3(
    (agg, __file) => {
      const { hash } = __file;
      return [...agg, [hash, stepFunction(state, plugin, __file)]];
    },
    [],
    files
  )
);
var fileProcessor = curry5(
  (context, plugins, files) => pipe3(
    topologicalDependencySort,
    reduce3(
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
      hashMap: pipe3(
        map3((x) => [prop("hash", x), prop("file", x)]),
        fromPairs
      )(files)
    })
  )(plugins)
);
var futureApplicator = curry5((context, plugins, files) => ({
  state: pipe3(
    map3((plugin) => {
      log.run("plugin", {
        plugin,
        name: plugin.name,
        dependencies: plugin.dependencies
      });
      return [
        plugin.name,
        pipe3(
          map3((file) => [file.hash, stepFunction(context, plugin, file)]),
          fromPairs
        )(files)
      ];
    }),
    (z) => {
      log.run(
        "state updated...",
        map3(([k]) => k, z)
      );
      return z;
    },
    fromPairs
  )(plugins),
  files,
  hashes: pipe3(
    map3((z) => [prop("hash", z), prop("file", z)]),
    fromPairs
  )(files),
  plugins: map3(prop("name"), plugins)
}));
var futureFileProcessor = curry5(
  (context, pluginsF, filesF) => pipe3(
    pap(map3(topologicalDependencySort, pluginsF)),
    pap(filesF)
  )(resolve(futureApplicator(context)))
);

// src/validate.js
import {
  of,
  ap as ap2,
  without as without2,
  all,
  applySpec as applySpec2,
  curry as curry6,
  equals,
  keys,
  pipe as pipe4,
  propOr as propOr2,
  reduce as reduce4,
  reject as reject2,
  values
} from "ramda";
var kindIs = curry6((expected, x) => equals(expected, typeof x));
var coerce = (x) => !!x;
var PLUGIN_SHAPE = {
  // unique identifier for the plugin
  name: pipe4(propOr2(false, "name"), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe4(propOr2(false, "fn"), kindIs("function")),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe4(
    propOr2(() => {
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
  store: pipe4(
    propOr2(() => {
    }, "store"),
    kindIs("function")
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe4(propOr2([], "dependencies"), Array.isArray)
};
var EXPECTED_KEYS = keys(PLUGIN_SHAPE);
var noExtraKeys = (x) => pipe4(
  keys,
  without2(EXPECTED_KEYS),
  (y) => y.length ? `Found additional or misspelled keys: [${y.join(", ")}]` : ``
)(x);
var testPlugin = pipe4(
  of,
  ap2([applySpec2(PLUGIN_SHAPE), noExtraKeys]),
  ([x, error]) => error ? { ...x, error } : x
);
var checkPlugin = pipe4(testPlugin, values, all(equals(true)));
var validatePlugins = reduce4((agg, plugin) => {
  const check = checkPlugin(plugin);
  const name = propOr2("unnamed", "name", plugin);
  if (!check) {
    const err = [name, pipe4(testPlugin, reject2(equals(true)), keys)(plugin)];
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
