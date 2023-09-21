#!/usr/bin/env node

// src/index.js
import { pipe as pipe2, map as map2, chain as chain2 } from "ramda";
import { parallel as parallel2 } from "fluture";
import { readDir as readDir2 } from "file-system";
import { fileProcessor as fileProcessor2 } from "monoplug";

// src/reader.js
import path from "node:path";
import {
  curry,
  pipe,
  map,
  split,
  addIndex,
  fromPairs,
  chain,
  __ as $
} from "ramda";
import { parallel } from "fluture";
import { readDir, readFile } from "file-system";
import { fileProcessor } from "monoplug";

// src/hash.js
import crypto from "node:crypto";
var hash = (buf) => {
  const sum = crypto.createHash("sha256");
  sum.update(buf);
  return sum.digest("hex");
};

// src/reader.js
var trace = curry((a, b) => {
  console.log(a, b);
  return b;
});
var readMonoFile = curry((basePath, file) => {
  return pipe(
    readFile,
    map(
      (buf) => pipe(
        split("\n"),
        addIndex(map)((y, i) => [i, y]),
        (body) => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          body
        })
      )(buf)
    )
  )(file);
});
var reader = curry(
  ({ basePath }, dirglob) => pipe(
    trace(">>@>@>@"),
    readDir,
    map(trace("dir files")),
    chain(
      (files) => pipe(
        map(readMonoFile(basePath)),
        parallel(10),
        map(trace("files")),
        map((content) => ({
          content,
          files: pipe(
            map((f) => [f.hash, f.file]),
            fromPairs
          )(content)
        }))
      )(files)
    )
  )(dirglob)
);
var monoprocessor = curry(
  (config, plugins, dirGlob) => pipe(
    reader({ basePath: config.basePath }),
    map((xxx) => fileProcessor(config, plugins, xxx.content))
  )(dirGlob)
);
