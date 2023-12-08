// src/index.js
import { parse, stringify } from "smol-toml";
var plugin = {
  name: "toml",
  read: parse,
  write: stringify
};
var src_default = plugin;
export {
  src_default as default
};
