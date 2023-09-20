#!/usr/bin/env node

// src/index.js
import { pipe as pipe2, map as map2, chain as chain2 } from "ramda";
import { parallel as parallel2 } from "fluture";
import { readDir as readDir2 } from "file-system";

// src/reader.js
import path from "node:path";
import { curry, pipe, map, split, addIndex, chain, __ as $ } from "ramda";
import { parallel } from "fluture";
import { readDir, readFile } from "file-system";
import { taskProcessor } from "monoplug";

// src/hash.js
import crypto from "node:crypto";
var hash = (buf) => {
  const sum = crypto.createHash("sha256");
  sum.update(buf);
  return sum.digest("hex");
};

// src/reader.js
var readMonoFile = curry((basePath, file) => {
  return pipe(
    readFile,
    map(
      (buf) => pipe(
        split("\n"),
        addIndex(map)((y, i) => [i, y]),
        (lines) => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          lines
        })
      )(buf)
    )
  )(file);
});
var reader = curry(
  ({ basePath }, dirglob) => pipe(readDir, chain(pipe(map(readMonoFile(basePath)), parallel(10))))(dirglob)
);
var monoprocessor = curry(
  ({ basePath }, plugins, dirGlob) => pipe(reader({ basePath }), map(taskProcessor($, plugins)))(dirGlob)
);

// src/index.js
var monocle = pipe2(readDir2, map2(map2(reader)), chain2(parallel2(10)));
export {
  monocle
};
