// src/index.js
import { pipe } from "ramda";
import { parse } from "smol-toml";
var plugin = {
  name: "toml",
  test: pipe(parse, (z) => typeof z !== "undefined"),
  parse
};
var src_default = plugin;
export {
  src_default as default
};
