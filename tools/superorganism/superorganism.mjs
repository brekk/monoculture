// src/index.js
import binaryPath from "project-bin-path";
import utils from "nps-utils";
import { $ } from "execa";
var all = Promise.all;
var sd = (script, description = "") => !!description ? { script, description } : { script };
var main = {
  ...utils,
  $,
  all,
  sd,
  binaryPath
};
var src_default = main;
export {
  all,
  src_default as default,
  sd
};
