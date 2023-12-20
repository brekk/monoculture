#!/usr/bin/env node

// src/index.js
import {
  last,
  init,
  propOr,
  curry,
  replace,
  join,
  map,
  pipe,
  split
} from "ramda";
import { flexecaWithCanceller } from "file-system";
var words = split(" ");
var lines = split("\n");
var unlines = join("\n");
var parser = pipe(
  lines,
  map(
    pipe(replace(/(.*) ([0-9a-f]{7}) (.*)/, "$1 $2"), words, (sliced) => {
      const commit = last(sliced);
      const tree = pipe(init, join(" "))(sliced);
      return { commit, tree };
    })
  )
);
var gitgraph = curry(
  (cancel, argv) => pipe(
    flexecaWithCanceller(cancel, "git"),
    map(propOr("", "stdout")),
    map(parser)
  )(["log", "--decorate", "--graph", "--oneline", ...argv])
);
var renderTree = pipe(
  map(({ commit: c = "", tree: t = "" }) => t + " " + c),
  unlines
);
export {
  gitgraph,
  parser,
  renderTree
};
