#!/usr/bin/env node

// src/find-up.js
import { Future } from "fluture";
import { curry } from "ramda";
import { findUp as __findUp } from "find-up";
var findUpWithCancel = curry(
  (cancel, opts, x) => Future((bad, good) => {
    __findUp(x, opts).catch(bad).then((raw) => raw ? good(raw) : bad(new Error("No config file found!")));
    return cancel;
  })
);
var findUp = findUpWithCancel(() => {
});

// src/flexeca.js
import { pipe, curry as curry2, ifElse, propOr } from "ramda";
import { execa } from "execa";
import { Future as Future2 } from "fluture";
var didFail = propOr(true, "failed");
var fail = propOr("Something broke", "stderr");
var flexecaWithCanceller = curry2(
  (cancellation, cmd, args) => new Future2((bad, good) => {
    execa(cmd, args).catch(pipe(fail, (z) => `FAILED: "${z}"`, bad)).then(ifElse(didFail, pipe(fail, bad), good));
    return cancellation;
  })
);
var flexeca = flexecaWithCanceller(() => {
});

// src/fs.js
import fs from "node:fs";
import { reduce, F, propOr as propOr2, without, curry as curry3, pipe as pipe2, map, __ as $ } from "ramda";
import {
  Future as Future3,
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
var readFileWithFormatAndCancel = curry3(
  (cancel, format, x) => Future3((bad, good) => {
    fs.readFile(x, format, (err, data) => err ? bad(err) : good(data));
    return cancel;
  })
);
var readFileWithCancel = readFileWithFormatAndCancel($, "utf8");
var readFile = readFileWithCancel(NO_OP);
var readJSONFileWithCancel = curry3(
  (cancel, x) => pipe2(readFileWithCancel(cancel), map(JSON.parse))(x)
);
var readJSONFile = readJSONFileWithCancel(NO_OP);
var readDirWithConfigAndCancel = curry3(
  (cancel, conf, g) => Future3((bad, good) => {
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
var writeFileWithConfigAndCancel = curry3(
  (cancel, conf, file, content) => new Future3((bad, good) => {
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
var removeFileWithConfigAndCancel = curry3(
  (cancel, options, fd) => new Future3((bad, good) => {
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
var removeFilesWithConfigAndCancel = curry3(
  (cancel, conf, list) => pipe2(
    map(removeFileWithConfigAndCancel(cancel, without(["parallel"], conf))),
    parallel(propOr2(10, "parallel", conf))
  )(list)
);
var removeFilesWithConfig = removeFilesWithConfigAndCancel(NO_OP);
var removeFiles = removeFilesWithConfig(DEFAULT_REMOVAL_CONFIG);
var mkdir = curry3(
  (conf, x) => new Future3((bad, good) => {
    fs.mkdir(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var mkdirp = mkdir({ recursive: true });
var access = curry3(
  (permissions, filePath) => new Future3((bad, good) => {
    fs.access(filePath, permissions, (err) => err ? bad(err) : good(true));
    return () => {
    };
  })
);
var exists = access(constants.F_OK);
var readable = access(constants.R_OK);
var directoryOnly = (filePath) => filePath.slice(0, filePath.lastIndexOf("/"));
var writeFileWithAutoPath = curry3(
  (filePath, content) => pipe2(
    directoryOnly,
    (dir) => pipe2(
      exists,
      chainRej(() => mkdirp(dir))
    )(dir),
    chain(() => writeFile(filePath, content))
  )(filePath)
);
var rm = curry3(
  (conf, x) => new Future3((bad, good) => {
    fs.rm(x, conf, (err) => err ? bad(err) : good(x));
    return () => {
    };
  })
);
var rimraf = rm({ force: true, recursive: true });
var ioWithCancel = curry3(
  (cancel, fn, fd, buffer, offset, len, position) => Future3((bad, good) => {
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
var findFile = curry3(
  (fn, def, x) => pipe2(
    map(pipe2(fn, mapRej(F))),
    reduce((a, b) => isFuture(a) ? race(a)(b) : b, def)
  )(x)
);
var readAnyOr = curry3((def, format, x) => findFile(readFile, def, x));
var readAny = readAnyOr(null);
var requireAnyOr = findFile(readable);

// src/interpret.js
import { Future as Future4 } from "fluture";
var interpret = (filepath) => Future4((bad, good) => {
  import(filepath).catch(bad).then(good);
  return () => {
  };
});

// src/path.js
import { join, normalize } from "node:path";
import { curry as curry4 } from "ramda";
var pathRelativeTo = curry4((pwd, x) => {
  if (typeof pwd !== "string" || typeof x !== "string") {
    throw new Error("Cannot normalize bad paths.");
  }
  return join(pwd, normalize(x));
});
export {
  DEFAULT_REMOVAL_CONFIG,
  NO_OP,
  access,
  directoryOnly,
  exists,
  findFile,
  findUp,
  findUpWithCancel,
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
