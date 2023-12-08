// src/index.js
import { pipe, map } from "ramda";
import { parseAllDocuments, parse } from "yaml";
var plugin = {
  name: "yaml",
  test: pipe(parse, (raw) => raw && typeof raw === "object"),
  parse
};
var src_default = plugin;
var many = {
  name: "yaml-many",
  test: pipe(parseAllDocuments, (raw) => raw && typeof raw === "object"),
  parse: pipe(
    parseAllDocuments,
    map((zz) => zz.toJS())
  )
};
export {
  src_default as default,
  many,
  plugin
};
