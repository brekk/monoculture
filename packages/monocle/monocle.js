#!/usr/bin/env node

// src/hash.js
import crypto from "node:crypto";
var hash = (buf) => {
  const sum = crypto.createHash("sha256");
  sum.update(buf);
  return sum.digest("hex");
};

// src/reader.js
import path from "node:path";
import { curry, pipe, map, split, addIndex, fromPairs, chain } from "ramda";
import { parallel, resolve } from "fluture";
import { readDirWithConfig, readFile } from "file-system";
import { futureFileProcessor } from "monorail";
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
var readAll = curry(
  (config, dirglob) => pipe(
    readDirWithConfig(config),
    chain(
      (files) => pipe(map(readMonoFile(config.basePath)), parallel(10))(files)
    )
  )(dirglob)
);
var monoprocessor = curry(
  (config, plugins, dirGlob) => pipe(readAll(config), futureFileProcessor(config, resolve(plugins)))(dirGlob)
);
export {
  hash,
  monoprocessor,
  readAll,
  readMonoFile
};
