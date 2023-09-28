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
import {
  rm as __rm,
  mkdir as __mkdir,
  readFile as __readFile,
  writeFile as __writeFile,
  access as __access,
  constants
} from "node:fs";
import { propOr as propOr2, without, curry as curry2, pipe as pipe2, map } from "ramda";
import { chain, chainRej, Future as Future2, parallel } from "fluture";
import glob from "glob";
var localize = (z) => `./${z}`;
var readFile = (x) => new Future2((bad, good) => {
  __readFile(x, "utf8", (err, data) => err ? bad(err) : good(data));
  return () => {
  };
});
var readJSONFile = pipe2(readFile, map(JSON.parse));
var readDirWithConfig = curry2(
  (conf, g) => Future2((bad, good) => {
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
    return () => {
    };
  })
);
var readDir = readDirWithConfig({});
var writeFileWithConfig = curry2(
  (conf, file, content) => new Future2((bad, good) => {
    __writeFile(file, content, conf, (e) => {
      if (e) {
        bad(e);
        return;
      }
      good(content);
    });
    return () => {
    };
  })
);
var writeFile = writeFileWithConfig({ encoding: "utf8" });
var removeFileWithConfig = curry2(
  (options, fd) => new Future2((bad, good) => {
    __rm(fd, options, (err) => err ? bad(err) : good(fd));
    return () => {
    };
  })
);
var DEFAULT_REMOVAL_CONFIG = {
  force: false,
  maxRetries: 0,
  recursive: false,
  retryDelay: 100,
  parallel: 10
};
var removeFile = removeFileWithConfig(DEFAULT_REMOVAL_CONFIG);
var removeFilesWithConfig = curry2(
  (conf, list) => pipe2(
    map(removeFileWithConfig(without(["parallel"], conf))),
    parallel(propOr2(10, "parallel", conf))
  )(list)
);
var removeFiles = removeFilesWithConfig(DEFAULT_REMOVAL_CONFIG);
var mkdir = curry2(
  (conf, x) => new Future2((bad, good) => {
    __mkdir(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var mkdirp = mkdir({ recursive: true });
var access = curry2(
  (permissions, filePath) => new Future2((bad, good) => {
    __access(filePath, permissions, (err) => err ? bad(err) : good(true));
    return () => {
    };
  })
);
var exists = access(constants.F_OK);
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
    __rm(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var rimraf = rm({ force: true, recursive: true });

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
  access,
  directoryOnly,
  exists,
  flexeca,
  flexecaWithCanceller,
  interpret,
  localize,
  mkdir,
  mkdirp,
  pathRelativeTo,
  readDir,
  readDirWithConfig,
  readFile,
  readJSONFile,
  removeFile,
  removeFileWithConfig,
  removeFiles,
  removeFilesWithConfig,
  rimraf,
  rm,
  writeFile,
  writeFileWithAutoPath,
  writeFileWithConfig
};
