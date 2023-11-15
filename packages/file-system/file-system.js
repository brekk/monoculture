#!/usr/bin/env node

// src/flexeca.js
import { pipe, curry, ifElse, propOr } from "ramda";
import { execa } from "execa";
import { Future } from "fluture";
var didFail = propOr(true, "failed");
var fail = propOr("Something broke", "stderr");
var flexecaWithCanceller = curry(
  (cancellation, cmd, args) => new Future((bad, good) => {
    execa(cmd, args).catch(pipe(fail, (z) => `FAILED: "${z}"`, bad)).then(ifElse(didFail, pipe(fail, bad), good));
    return cancellation;
  })
);
var flexeca = flexecaWithCanceller(() => {
});

// src/fs.js
import fs from "node:fs";
import { reduce, F, propOr as propOr2, without, curry as curry2, pipe as pipe2, map, __ as $ } from "ramda";
import {
  Future as Future2,
  chain,
  chainRej,
  isFuture,
  mapRej,
  parallel,
  race
} from "fluture";
import glob from "glob";
var { constants } = fs;
var NO_OP = () => {
};
var localize = (z) => `./${z}`;
var readFileWithFormatAndCancel = curry2(
  (cancel, format, x) => Future2((bad, good) => {
    fs.readFile(x, format, (err, data) => err ? bad(err) : good(data));
    return cancel;
  })
);
var readFileWithCancel = readFileWithFormatAndCancel($, "utf8");
var readFile = readFileWithCancel(NO_OP);
var readJSONFileWithCancel = curry2(
  (cancel, x) => pipe2(readFileWithCancel(cancel), map(JSON.parse))(x)
);
var readJSONFile = readJSONFileWithCancel(NO_OP);
var readDirWithConfigAndCancel = curry2(
  (cancel, conf, g) => Future2((bad, good) => {
    try {
      glob(
        g,
        conf,
        (e, x) => (
          // thus far I cannot seem to ever call `bad` from within here
          e ? bad(e) : good(x)
        )
      );
    } catch (e) {
      bad(e);
    }
    return cancel;
  })
);
var readDirWithConfig = readDirWithConfigAndCancel(NO_OP);
var readDir = readDirWithConfig({});
var writeFileWithConfigAndCancel = curry2(
  (cancel, conf, file, content) => new Future2((bad, good) => {
    fs.writeFile(file, content, conf, (e) => {
      if (e) {
        bad(e);
        return;
      }
      good(content);
    });
    return cancel;
  })
);
var writeFileWithConfig = writeFileWithConfigAndCancel(NO_OP);
var writeFile = writeFileWithConfig({ encoding: "utf8" });
var removeFileWithConfigAndCancel = curry2(
  (cancel, options, fd) => new Future2((bad, good) => {
    fs.rm(fd, options, (err) => err ? bad(err) : good(fd));
    return cancel;
  })
);
var removeFileWithConfig = removeFileWithConfigAndCancel(NO_OP);
var DEFAULT_REMOVAL_CONFIG = {
  force: false,
  maxRetries: 0,
  recursive: false,
  retryDelay: 100,
  parallel: 10
};
var removeFile = removeFileWithConfig(DEFAULT_REMOVAL_CONFIG);
var removeFilesWithConfigAndCancel = curry2(
  (cancel, conf, list) => pipe2(
    map(removeFileWithConfigAndCancel(cancel, without(["parallel"], conf))),
    parallel(propOr2(10, "parallel", conf))
  )(list)
);
var removeFilesWithConfig = removeFilesWithConfigAndCancel(NO_OP);
var removeFiles = removeFilesWithConfig(DEFAULT_REMOVAL_CONFIG);
var mkdir = curry2(
  (conf, x) => new Future2((bad, good) => {
    fs.mkdir(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var mkdirp = mkdir({ recursive: true });
var access = curry2(
  (permissions, filePath) => new Future2((bad, good) => {
    fs.access(filePath, permissions, (err) => err ? bad(err) : good(true));
    return () => {
    };
  })
);
var exists = access(constants.F_OK);
var readable = access(constants.R_OK);
var directoryOnly = (filePath) => filePath.slice(0, filePath.lastIndexOf("/"));
var writeFileWithAutoPath = curry2(
  (filePath, content) => pipe2(
    directoryOnly,
    (dir) => pipe2(
      exists,
      chainRej(() => mkdirp(dir))
    )(dir),
    chain(() => writeFile(filePath, content))
  )(filePath)
);
var rm = curry2(
  (conf, x) => new Future2((bad, good) => {
    fs.rm(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var rimraf = rm({ force: true, recursive: true });
var ioWithCancel = curry2(
  (cancel, fn, fd, buffer, offset, len, position) => Future2((bad, good) => {
    fn(
      fd,
      buffer,
      offset,
      len,
      position,
      (e, bytes, buff) => e ? bad(e) : good(bytes, buff)
    );
    return cancel;
  })
);
var io = ioWithCancel(NO_OP);
var read = io(fs.read);
var write = io(fs.write);
var findFile = curry2(
  (fn, def, x) => pipe2(
    map(pipe2(fn, mapRej(F))),
    reduce((a, b) => isFuture(a) ? race(a)(b) : b, def)
  )(x)
);
var readAnyOr = curry2((def, format, x) => findFile(readFile, def, x));
var readAny = readAnyOr(null);
var requireAnyOr = findFile(readable);

// src/path.js
import { join, normalize } from "node:path";
import { curry as curry3 } from "ramda";
var pathRelativeTo = curry3((pwd, x) => {
  if (typeof pwd !== "string" || typeof x !== "string") {
    throw new Error("Cannot normalize bad paths.");
  }
  return join(pwd, normalize(x));
});

// src/interpret.js
import { Future as Future3 } from "fluture";
var interpret = (filepath) => Future3((bad, good) => {
  import(filepath).catch(bad).then(good);
  return () => {
  };
});
export {
  DEFAULT_REMOVAL_CONFIG,
  NO_OP,
  access,
  directoryOnly,
  exists,
  findFile,
  flexeca,
  flexecaWithCanceller,
  interpret,
  io,
  ioWithCancel,
  localize,
  mkdir,
  mkdirp,
  pathRelativeTo,
  read,
  readAny,
  readAnyOr,
  readDir,
  readDirWithConfig,
  readDirWithConfigAndCancel,
  readFile,
  readFileWithCancel,
  readFileWithFormatAndCancel,
  readJSONFile,
  readJSONFileWithCancel,
  readable,
  removeFile,
  removeFileWithConfig,
  removeFileWithConfigAndCancel,
  removeFiles,
  removeFilesWithConfig,
  removeFilesWithConfigAndCancel,
  requireAnyOr,
  rimraf,
  rm,
  write,
  writeFile,
  writeFileWithAutoPath,
  writeFileWithConfig,
  writeFileWithConfigAndCancel
};
