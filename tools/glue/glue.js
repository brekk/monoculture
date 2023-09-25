#!/usr/bin/env node

// src/trace.js
import { curry, __ as $, identity as I } from "ramda";
var scopedBinaryEffect = curry((effect, scope, a, b) => {
  effect(a, scope(b));
  return b;
});
var binaryEffect = scopedBinaryEffect($, I);
var trace = binaryEffect(console.log);
export {
  binaryEffect,
  scopedBinaryEffect,
  trace
};
