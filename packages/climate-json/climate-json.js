// src/index.js
import { pipe } from "ramda";
var plugin = {
  name: "json",
  test: pipe(JSON.parse, (raw) => raw && typeof raw === "object"),
  parse: JSON.parse
};
var src_default = plugin;
export {
  src_default as default,
  plugin
};
