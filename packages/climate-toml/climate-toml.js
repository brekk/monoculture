// src/index.js
import {
  pipe,
  map,
  trim,
  filter,
  identity as I,
  all,
  anyPass,
  startsWith,
  test,
  split
} from "ramda";
import { parse } from "smol-toml";
var plugin = {
  name: "toml",
  test: pipe(
    split("\n"),
    map(trim),
    filter(I),
    all(anyPass([startsWith("#"), startsWith("["), test(/(.*) = (.*)/)]))
  ),
  parse
};
var src_default = plugin;
export {
  src_default as default
};
