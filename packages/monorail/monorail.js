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
import { curry as curry5, fromPairs, identity as I, map as map2, pipe as pipe2, prop, reduce as reduce2 } from "ramda";
import { pap, resolve } from "fluture";

// src/helpers.js
import {
  __ as $,
  any,
  ap,
  curry as curry3,
  defaultTo,
  filter,
  find,
  findLast,
  head,
  last,
  length,
  lt,
  map,
  pipe,
  propOr,
  reduce,
  slice,
  test
} from "ramda";
import { trace } from "xtrace";
var getBody = propOr([], "body");
var bodyTest = curry3(
  (fn, file, needle) => pipe(getBody, fn(pipe(last, test(needle))))(file)
);
var _reduce = curry3(
  (file, fn, initial) => pipe(getBody, reduce(fn, initial))(file)
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
    ap([onLine($, start), onLastLine($, end), getBody]),
    ([a, z, body]) => a === -1 || z === -1 ? [] : filter(([line]) => a <= line && line <= z)(body)
  )(file)
);
var selectAll = curry3(
  (file, start, end) => pipe(
    getBody,
    reduce(
      ({ active, all: all2, current }, [line, content]) => {
        const testContent = test($, content);
        const checkStart = testContent(start);
        const stillActive = checkStart || active;
        if (stillActive) {
          const newCurrent = current.concat([line, content]);
          const checkEnd = testContent(end);
          if (checkEnd) {
            return {
              active: false,
              all: all2.concat([newCurrent]),
              current: []
            };
          }
          return {
            active: !checkEnd,
            all: all2,
            current: newCurrent
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
  )(file)
);
var _filter = bodyTest(filter);
var makeFileHelpers = (file) => ({
  any: _any(file),
  onLines: onLines(file),
  onLine: onLine(file),
  filter: _filter(file),
  between: selectBetween(file),
  selectAll: selectAll(file),
  reduce: _reduce(file)
});
var _getConfigFrom = curry3((name, c) => c?.config?.[name]);
var makePluginHelpers = curry3((state, plugin) => ({
  config: _getConfigFrom(plugin.name, state)
}));

// src/sort.js
import { curry as curry4, reject, propEq } from "ramda";
import { Sorter } from "@hapi/topo";

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
var withoutProp = curry4(
  (prop2, value, x) => reject(propEq(value, prop2), x)
);
var handleDefault = (rawPlug) => rawPlug?.default ?? rawPlug;
var toposort = (raw) => {
  const list = raw.slice().map(handleDefault);
  const t = new Sorter();
  list.forEach(({ group, name, dependencies: after }) => {
    t.add(name, {
      after,
      manual: true,
      group: group || name
    });
  });
  t.sort();
  return log.sort("sorted!", t.nodes).map((sortName) => list.find((z) => z.name === sortName));
};

// src/runner.js
var stepFunction = curry5((state, plugin, file) => {
  log.run(`plugin [${plugin.name}]`, plugin);
  log.run(`file [${file.name}]`, file);
  const { selector = I, preserveLine = false, fn } = plugin;
  const selected = selector(state);
  const base = makeFileHelpers(file);
  const plugged = makePluginHelpers(state, plugin);
  const helpers = { ...base, ...plugged };
  const output = preserveLine ? {
    ...file,
    body: map2(([k, v]) => [k, fn(selected, v, helpers)])(file.body)
  } : fn(selected, file, helpers);
  return output;
});
var runPluginOnFilesWithContext = curry5((context, files, plugin) => {
  if (!plugin.name)
    return [];
  log.run("applying plugin", plugin.name);
  return pipe2(
    map2((file) => [file.name, stepFunction(context, plugin, file)]),
    fromPairs
  )(files);
});
var getNames = map2(prop("name"));
var getHashes = pipe2(
  map2((z) => [prop("name", z), prop("hash", z)]),
  fromPairs
);
var statefulApplicator = curry5((context, plugins, files) => {
  const { HELP: _h, basePath: _b, cwd: _c, ...config } = context;
  return reduce2(
    (agg, plugin) => ({
      ...agg,
      state: {
        ...agg.state,
        [plugin.name]: pipe2(runPluginOnFilesWithContext(agg, files))(plugin)
      }
    }),
    {
      state: {},
      filenames: getNames(files),
      hashes: getHashes(files),
      plugins: getNames(plugins),
      config
    },
    plugins
  );
});
var futureFileProcessor = curry5(
  (context, pluginsF, filesF) => pipe2(
    resolve,
    pap(map2(toposort, pluginsF)),
    pap(filesF)
  )(statefulApplicator(context))
);

// src/validate.js
import {
  of,
  ap as ap2,
  without,
  all,
  applySpec,
  curry as curry6,
  equals,
  keys,
  pipe as pipe3,
  propOr as propOr2,
  reduce as reduce3,
  reject as reject2,
  values
} from "ramda";
var kindIs = curry6((expected, x) => equals(expected, typeof x));
var coerce = (x) => !!x;
var PLUGIN_SHAPE = {
  // unique identifier for the plugin
  name: pipe3(propOr2(false, "name"), coerce),
  // the "fn" property actually produces a value given
  // (selectedContext, config, file) => and stores it keyed by "name"
  fn: pipe3(propOr2(false, "fn"), kindIs("function")),
  // the selector function accesses part of context to pass it to the "fn" transformer
  selector: pipe3(
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
  store: pipe3(
    propOr2(() => {
    }, "store"),
    kindIs("function")
  ),
  // does this plugin depend on anything specific to have happened before this?
  dependencies: pipe3(propOr2([], "dependencies"), Array.isArray)
};
var EXPECTED_KEYS = keys(PLUGIN_SHAPE);
var noExtraKeys = (x) => pipe3(
  keys,
  without(EXPECTED_KEYS),
  (y) => y.length ? `Found additional or misspelled keys: [${y.join(", ")}]` : ``
)(x);
var testPlugin = pipe3(
  of,
  ap2([applySpec(PLUGIN_SHAPE), noExtraKeys]),
  ([x, error]) => error ? { ...x, error } : x
);
var checkPlugin = pipe3(testPlugin, values, all(equals(true)));
var validatePlugins = reduce3((agg, plugin) => {
  const check = checkPlugin(plugin);
  const name = propOr2("unnamed", "name", plugin);
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
  futureFileProcessor,
  getHashes,
  getNames,
  insertAfter,
  kindIs,
  noExtraKeys,
  statefulApplicator,
  stepFunction,
  tertiary,
  tertiaryWithCancel,
  testPlugin,
  toposort,
  unary,
  unaryWithCancel,
  validatePlugins,
  withoutProp
};
