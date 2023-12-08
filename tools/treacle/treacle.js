#!/usr/bin/env node

// src/index.js
import {
  last,
  filter,
  init,
  propOr,
  __ as $,
  add,
  always as K,
  curry,
  replace,
  equals,
  findIndex,
  ifElse,
  join,
  map,
  pipe,
  slice,
  split,
  match,
  trim
} from "ramda";
import { fork } from "fluture";
import { flexecaWithCanceller } from "file-system";
import { trace } from "xtrace";
var words = split(" ");
var unwords = join(" ");
var lines = split("\n");
var unlines = join("\n");
var parser = pipe(
  propOr("", "stdout"),
  lines,
  trace("uhh"),
  map(replace(/(.*) ([0-9a-f]{7}) (.*)/, "$1 $2")),
  map(words),
  trace("ohhh"),
  map((sliced) => {
    const commit = last(sliced);
    const tree = pipe(init, join(" "))(sliced);
    return commit ? { commit, tree } : { tree };
  })
);
var faithful = curry(
  (cancel, argv) => pipe(
    flexecaWithCanceller(cancel, "git"),
    map(parser)
  )(["log", "--decorate", "--graph", "--oneline"])
);
var renderTree = pipe(
  // filter(({ commit }) => commit),
  map(({ commit: c = "", tree: t = "" }) => t + " " + c),
  unlines
);
pipe(
  map(renderTree),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(faithful(() => {
}, process.argv.slice(2)));
export {
  faithful,
  renderTree
};
