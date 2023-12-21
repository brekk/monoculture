#!/usr/bin/env node

// src/cli.js
import { cwd } from "node:process";

// package.json
var package_default = {
  name: "monodoc",
  version: "0.0.1",
  description: "magical documentation tooling \u2728",
  main: "monodoc.js",
  type: "module",
  repository: "brekk/monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  bin: "./monodoc-cli.js",
  dependencies: {
    climate: "workspace:packages/climate",
    "file-system": "workspace:packages/file-system",
    fluture: "^14.0.0",
    ramda: "^0.29.1"
  },
  devDependencies: {
    dotenv: "^16.3.1",
    "dotenv-cli": "^7.3.0",
    envtrace: "^0.0.2",
    esbuild: "^0.19.5",
    "eslint-config-monoculture": "workspace:shared/eslint-config-monoculture",
    "jest-environment-jsdom": "^29.7.0",
    madge: "^6.1.0",
    "strip-ansi": "^7.1.0",
    xtrace: "^0.3.0"
  },
  scripts: {
    nps: "dotenv -- nps -c ./package-scripts.cjs",
    build: "dotenv -- nps -c ./package-scripts.cjs build",
    "build:cli": "dotenv -- nps -c ./package-scripts.cjs build.cli",
    "build:module": "dotenv -- nps -c ./package-scripts.cjs build.module",
    "build:watch": "dotenv -- nps -c ./package-scripts.cjs build.watch",
    dev: "dotenv -- nps -c ./package-scripts.cjs dev",
    lint: "dotenv -- nps -c ./package-scripts.cjs lint",
    meta: "dotenv -- nps -c ./package-scripts.cjs meta",
    "meta:graph": "dotenv -- nps -c ./package-scripts.cjs meta.graph",
    test: "dotenv -- nps -c ./package-scripts.cjs test",
    "test:watch": "dotenv -- nps -c ./package-scripts.cjs test.watch"
  }
};

// src/cli.js
import { configurate } from "climate";
import { basename as basename2, join as pathJoin, dirname } from "node:path";
import {
  fromPairs as fromPairs2,
  last as last4,
  applySpec as applySpec3,
  prop,
  reduce as reduce3,
  always as K3,
  chain as chain2,
  curry as curry4,
  defaultTo as defaultTo3,
  filter as filter3,
  flatten as flatten2,
  groupBy,
  head as head3,
  identity as I2,
  join as join3,
  length as length4,
  lt,
  map as map6,
  path,
  pathOr as pathOr3,
  pipe as pipe6,
  propOr as propOr4,
  replace as replace4,
  slice as slice4,
  sortBy,
  toPairs as toPairs2,
  toUpper
} from "ramda";
import { resolve, parallel } from "fluture";
import {
  pathRelativeTo,
  readJSONFile,
  readDirWithConfig,
  writeFile,
  writeFileWithAutoPath
} from "file-system";

// src/parse.js
import { basename, extname } from "node:path";
import {
  defaultTo as defaultTo2,
  join as join2,
  curry as curry2,
  filter as filter2,
  flatten,
  head as head2,
  identity,
  last as last3,
  map as map4,
  pathOr,
  pipe as pipe4,
  propOr as propOr2,
  uniq as uniq2
} from "ramda";
import { readFile } from "file-system";

// src/file.js
import {
  addIndex,
  map,
  match,
  pipe,
  split,
  reduce,
  last,
  replace,
  init
} from "ramda";
var addLineNumbers = addIndex(map)((a, i) => [i, a]);
var findJSDocKeywords = match(/@(\w*)/g);
var cleanupKeywords = pipe(
  replace(/(.*)@(\w*)\s(.*)$/g, "$2 $3"),
  split(" ")
);
var groupContiguousBlocks = reduce((agg, raw) => {
  const [i = -1] = raw;
  const prev = last(agg);
  if (prev) {
    const top = last(prev);
    const [j = -1] = top;
    if (j + 1 === i) {
      return [...init(agg), prev.concat([raw])];
    }
  }
  return agg.concat([[raw]]);
}, []);

// src/text.js
import {
  reject,
  equals,
  length,
  includes,
  join,
  map as map2,
  pipe as pipe2,
  replace as replace2,
  slice,
  split as split2,
  startsWith,
  trim,
  when
} from "ramda";
var lines = split2("\n");
var unlines = join("\n");
var trimComment = pipe2(
  trim,
  when(startsWith("* "), slice(2, Infinity))
);
var trimSummary = pipe2(
  reject(equals("/**")),
  map2(trimComment),
  unlines
);
var nixKeyword = when(includes("@"), replace2(/@/g, ""));
var wipeComment = pipe2(trimComment, nixKeyword);
var formatComment = (block) => pipe2(
  map2(([, v]) => v),
  map2(trimComment),
  slice(1, length(block) - 1)
)(block);
var j2 = (x) => JSON.stringify(x, null, 2);
var stripRelative = replace2(/\.\.\//g, "");

// src/comment.js
import {
  propOr,
  __ as $,
  addIndex as addIndex2,
  always as K,
  anyPass,
  applySpec,
  chain,
  cond,
  curry,
  defaultTo,
  either,
  equals as equals2,
  filter,
  fromPairs,
  head,
  identity as I,
  ifElse,
  last as last2,
  length as length2,
  map as map3,
  match as match2,
  pipe as pipe3,
  reduce as reduce2,
  reject as reject2,
  replace as replace3,
  slice as slice2,
  startsWith as startsWith2,
  toPairs,
  trim as trim2,
  uniq
} from "ramda";
var linkRegex = /\{@link (.*)+\}/g;
var matchLinks = pipe3(
  chain(match2(linkRegex)),
  map3((z) => slice2("{@link ".length, z.length - 1, z))
);
var handleSpecificKeywords = curry(
  (keyword, value, rest, file, end, i) => cond([
    // if example found, pull from raw file
    [equals2("example"), () => getExample(file, end, i)],
    // if see found, do some light cleanup
    [equals2("see"), () => pipe3(head, slice2(0, -1))(rest)],
    // Consume pages + names as sentences
    [
      either(equals2("name"), equals2("page")),
      () => trim2(`${value} ${rest.join(" ")}`)
    ],
    // if an array value, concat it
    [() => rest.length, () => [value, ...rest]],
    // otherwise just return the value
    [K(true), () => value]
  ])(keyword)
);
var structureKeywords = curry(
  (file, block, end) => pipe3(
    map3(([i, line]) => [
      i,
      ifElse(
        pipe3(findJSDocKeywords, length2, (z) => z > 0),
        pipe3(wipeComment, cleanupKeywords),
        K(false)
      )(line)
    ]),
    filter(last2),
    map3(([i, [keyword, value = true, ...rest]]) => [
      i,
      [keyword, handleSpecificKeywords(keyword, value, rest, file, end, i)]
    ]),
    map3(last2),
    // fromPairs truncates duplicate keys, so we have to arrayify them
    reduce2(
      (agg, [key, ...value]) => agg[key] && Array.isArray(agg[key]) ? { ...agg, [key]: agg[key].concat(value) } : { ...agg, [key]: value },
      {}
    ),
    toPairs,
    map3(([k, v]) => [
      k,
      k !== "see" && Array.isArray(v) && v.length === 1 ? v[0] : v
    ]),
    fromPairs
  )(block)
);
var summarize = (lines2) => {
  const stripped = reject2(equals2("*"), lines2);
  return pipe3(
    addIndex2(map3)((x, i) => ifElse(startsWith2("@"), K(i), K(false))(x)),
    filter(I),
    head,
    defaultTo(length2(stripped)),
    slice2(0, $, stripped),
    unlines
  )(stripped);
};
var slug = (name) => {
  const slashPlus = name.lastIndexOf("/") + 1;
  return name.indexOf(".") > -1 ? name.slice(slashPlus, name.indexOf(".")) : name.slice(slashPlus);
};
var stripLeadingHyphen = replace3(/^-/g, "");
var getFileGroup = propOr("", "group");
var addTo = propOr("", "addTo");
var objectifyComments = curry(
  (filename, file, comments) => reduce2(
    (agg, block) => agg.concat(
      pipe3(
        // pass one
        applySpec({
          start: pipe3(head, head),
          end: pipe3(last2, head),
          lines: formatComment
        }),
        // pass two
        (gen) => {
          const structure = structureKeywords(file, block, gen.end);
          if (structure.page && !structure.name) {
            structure.name = structure.page;
            structure.detail = gen.start;
          }
          return {
            ...gen,
            summary: summarize(gen.lines),
            links: matchLinks(gen.lines),
            fileGroup: getFileGroup(structure),
            addTo: addTo(structure),
            structure,
            keywords: pipe3(unlines, findJSDocKeywords, uniq, (z) => z.sort())(
              gen.lines
            )
          };
        }
      )(block)
    ),
    [],
    comments
  )
);
var getExample = curry(
  (file, end, i) => pipe3(
    slice2(i + 1, end),
    map3(trimComment),
    map3(replace3(/^\*$/g, "")),
    unlines
  )(file)
);
var isJSDocComment = pipe3(
  trim2,
  anyPass([startsWith2("/**"), startsWith2("*"), startsWith2("*/")])
);

// src/parse.js
var getAny = curry2(
  (def, keyPath, comments) => pipe4(
    map4(pathOr(def, keyPath)),
    filter2(identity),
    uniq2,
    (x) => x.sort(),
    head2
  )(comments)
);
var parse = curry2((root, filename, content) => {
  const newName = stripRelative(filename);
  const newNameFolder = newName.slice(0, newName.lastIndexOf("/"));
  return pipe4(
    // String
    lines,
    // List String
    (raw) => pipe4(
      addLineNumbers,
      // List #[Integer, String]
      filter2(pipe4(last3, isJSDocComment)),
      // List #[Integer, String]
      groupContiguousBlocks,
      // List #[Integer, String]
      objectifyComments(newName, raw),
      // List CommentBlock
      (comments) => ({
        slugName: basename(newName, extname(newName)),
        pageSummary: pipe4(
          getAny("", ["structure", "pageSummary"]),
          defaultTo2([]),
          join2(" ")
        )(comments),
        filename: newName,
        comments,
        order: pipe4(
          getAny("0", ["structure", "order"]),
          (x) => parseInt(x, 10)
        )(comments),
        fileGroup: getAny("", ["fileGroup"], comments),
        links: pipe4(map4(propOr2([], "links")), flatten)(comments)
      })
    )(raw)
    // CommentedFile
  )(content);
});
var parseFile = curry2(
  (root, x) => pipe4(
    // String
    (filename) => pipe4(
      // String
      readFile,
      // Future<Error, String>
      map4(parse(root, filename)),
      // remove orphan comments (parser found it but its not well-formed)
      map4((p) => ({
        ...p,
        comments: pipe4(
          filter2(
            ({ lines: l, start, end, summary }) => start !== end && !!summary && l.length > 0
          )
        )(
          // && pipe(keys, length, lt(0))(structure)
          p.comments
        )
      }))
    )(filename)
    // CommentedFile
  )(x)
);

// src/renderer.js
import {
  ifElse as ifElse2,
  pipe as pipe5,
  applySpec as applySpec2,
  pathOr as pathOr2,
  propOr as propOr3,
  when as when2,
  startsWith as startsWith3,
  length as length3,
  always as K2,
  map as map5,
  slice as slice3
} from "ramda";
var stripFence = when2(startsWith3("```"), K2(""));
var liveExample = (ex) => pipe5(lines, map5(stripFence), slice3(1, length3(ex)), unlines)(ex);
var handleSpecialCases = ifElse2(
  // this is a special case where we want to be able to dynamically rename the page
  pathOr2(false, ["structure", "page"]),
  // but since we're cheating we don't want to list it as a comment
  K2("")
);
var commentToMarkdown = handleSpecialCases(
  pipe5(
    applySpec2({
      title: pathOr2("Unknown", ["structure", "name"]),
      // pageSummary: propOr('', 'pageSummary'),
      summary: propOr3("?", "summary"),
      links: propOr3([], "links"),
      example: pathOr2("", ["structure", "example"])
    }),
    ({ title, summary, links, example }) => [
      title ? "## " + title + "\n" : "",
      summary ? summary + "\n" : "",
      links.length ? "### See also\n - " + links.join("\n - ") + "\n" : "",
      example ? "### Usage\n" + example : "",
      example.includes("live=true") ? `

${liveExample(example)}` : ""
    ].join("")
  )
);

// src/config.js
import { curry as curry3 } from "ramda";
import yargsParser from "yargs-parser";
var parser = curry3((opts, args) => yargsParser(args, opts));
var YARGS_CONFIG = {
  alias: {
    input: ["i"],
    output: ["o"],
    search: ["s"],
    artifact: ["a"],
    ignore: ["g"],
    color: ["k"]
  },
  boolean: ["color"],
  configuration: {
    "strip-aliased": true
  }
};
var HELP_CONFIG = {
  help: "This text!",
  color: "Render stuff in color",
  input: "A file to read!",
  output: "The file to output!",
  search: "The glob to use for searching (default: '**//*.{js,jsx,ts,tsx}')",
  artifact: `Would you like to create an artifact file?
(Useful for downstream transformation)`,
  ignore: "Files to ignore when searching, can be specified multiple times"
};
var CONFIG_DEFAULTS = {
  color: true,
  ignore: [
    "**/node_modules/**",
    "**/coverage/**",
    "**/*.spec.{js,jsx,ts,tsx}",
    "**/fixture/**",
    "**/fixture.*"
  ],
  search: "**/*.{js,jsx,ts,tsx}"
};

// src/cli.js
var parsePackageName = (y) => {
  const slash = y.indexOf("/");
  const start = slash + 1;
  const end = y.indexOf("/", start);
  return y.slice(start, end);
};
var capitalToKebab = (s) => pipe6(
  replace4(/\//g, "-"),
  replace4(/--/g, "-")
)(s.replace(/[A-Z]/g, (match3) => `-` + match3));
var readPackageJsonWorkspaces = curry4(
  (root, x) => map6(
    pipe6(
      // grab the workspaces field
      propOr4([], "workspaces"),
      // we want directories only
      map6((z) => `${z}/`),
      // read all the directories
      map6(readDirWithConfig({ cwd: root }))
    )
  )(x)
);
var iterateOverWorkspacesAndReadFiles = curry4(
  (searchGlob, ignore, root, x) => map6(
    pipe6(
      // look for specific file types
      map6((workspace) => workspace + searchGlob),
      // exclude some search spaces
      chain2(
        readDirWithConfig({
          ignore,
          cwd: root
        })
      )
    )
  )(x)
);
var pullPageTitleFromAnyComment = pipe6(
  filter3(pathOr3(false, ["structure", "page"])),
  map6(path(["structure", "page"])),
  head3,
  defaultTo3(""),
  replace4(/\s/g, "-"),
  defaultTo3(false)
);
var capitalize = (raw) => `${toUpper(raw[0])}${slice4(1, Infinity)(raw)}`;
var cleanFilename = ({ workspace, fileGroup, filename, comments }) => {
  const title = pullPageTitleFromAnyComment(comments);
  const sliced = title || slug(filename);
  const result = capitalToKebab(sliced) + ".mdx";
  return (fileGroup ? fileGroup + "/" : "") + stripLeadingHyphen(sliced !== title ? capitalize(result) : result);
};
var combineFiles = curry4(
  (leftToRight, a, b) => !leftToRight ? combineFiles(true, b, a) : {
    ...a,
    ...b,
    comments: [...a.comments, ...b.comments],
    links: [...a.links, ...b.links]
  }
);
var prepareMetaFiles = curry4(
  (outputDir, workspace, commentedFiles) => pipe6(
    map6((raw) => [
      pipe6(cleanFilename, (x) => basename2(x, ".mdx"))(raw),
      pipe6(
        propOr4([], "comments"),
        filter3(pathOr3(false, ["structure", "name"])),
        head3,
        applySpec3({
          order: pipe6(
            pathOr3("0", ["structure", "order"]),
            (x) => parseInt(x, 10)
          ),
          group: pathOr3("", ["structure", "group"]),
          name: pipe6(pathOr3("???", ["structure", "name"]))
        })
      )(raw)
    ]),
    groupBy(pipe6(last4, propOr4("", "group"))),
    map6(
      pipe6(
        sortBy(pathOr3(0, ["order"])),
        map6(([title, { name }]) => [
          pipe6(capitalToKebab, stripLeadingHyphen)(title),
          name
        ]),
        fromPairs2
      )
    ),
    toPairs2,
    map6(
      ([folder, data]) => writeFileWithAutoPath(
        pathJoin(outputDir, workspace, folder, "_meta.json"),
        JSON.stringify(data, null, 2)
      )
    )
  )(commentedFiles)
);
var processHelpOrRun = (config) => {
  return config.help || !config.input || !config.output ? resolve(config.HELP) : runner(config);
};
var runner = ({
  input,
  output,
  search: searchGlob = CONFIG_DEFAULTS.search,
  ignore = CONFIG_DEFAULTS.ignore,
  artifact = false
}) => {
  const current = cwd();
  const rel = pathRelativeTo(current);
  const [pkgJson, outputDir, relativeArtifact] = map6(rel, [
    input,
    output,
    artifact
  ]);
  const root = pkgJson.slice(0, pkgJson.lastIndexOf("/"));
  const toLocal = input.slice(0, input.lastIndexOf("/"));
  const relativize = (r) => toLocal + "/" + r;
  return pipe6(
    // read the package.json file
    readJSONFile,
    // reach into the Future
    readPackageJsonWorkspaces(root),
    // take the Future of an array of Futures, make it a single Future
    chain2(parallel(10)),
    // take [[apps/workspace, apps/workspace2], [scripts/workspace]]
    // and make them [apps/workspace, apps/workspace2, scripts/workspace]
    map6(flatten2),
    // let's add globs
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    // Future<error, Future<error, string>[]>
    chain2(parallel(10)),
    // Future<error, string[]>
    // take [[files, in], [workspaces]] and make them [files, in, workspaces]
    map6(flatten2),
    map6(map6(relativize)),
    // check each file for comments
    // Future<error, Future<error, CommentBlock>[]>
    map6(chain2(parseFile(root))),
    // Future<error, CommentBlock[]>
    chain2(parallel(10)),
    // Future<error, CommentBlock[]>
    // exclude any files which don't have any comments
    map6(filter3(pipe6(propOr4([], "comments"), length4, lt(0)))),
    map6(
      map6((raw) => {
        const filename = stripRelative(raw.filename);
        return {
          ...raw,
          comments: raw.comments.map((r) => ({ ...r, filename })),
          filename,
          workspace: parsePackageName(filename)
        };
      })
    ),
    map6(
      reduce3((agg, file) => {
        const filenames = map6(prop("filename"), agg);
        const alreadyInList = filenames.includes(file.filename);
        const anyFile = file.comments.filter(
          ({ structure }) => structure.asFile
        );
        const someFile = anyFile.length > 0 ? anyFile[0] : false;
        const asFilePath = pipe6(
          defaultTo3({}),
          pathOr3("???", ["structure", "asFile"])
        )(someFile);
        const withOrder = pipe6(
          pathOr3("0", ["structure", "order"]),
          (x) => parseInt(x, 10)
        )(someFile);
        const dir = dirname(file.filename);
        const newFile = someFile ? pathJoin(dir, asFilePath) : "???";
        return alreadyInList ? map6((raw) => {
          const check = raw.filename === file.filename;
          return check ? combineFiles(raw.order < withOrder, raw, file) : raw;
        })(agg) : [
          ...agg,
          someFile ? {
            ...file,
            filename: newFile,
            order: withOrder,
            originalFilename: file.filename
          } : file
        ];
      }, [])
    ),
    // map(scopedBinaryEffect(console.log, j2, 'pre write')),
    // if you gave an artifact
    artifact ? (
      // write to a file
      chain2(
        (content) => pipe6(
          // (as JSON)
          j2,
          writeFile(relativeArtifact),
          // but persist our original content for downstream consumption
          map6(K3(content))
        )(content)
      )
    ) : (
      // otherwise do nothing (identity)
      I2
    ),
    // x => x
    // underlying structure here is { [filename]: CommentBlock[] }
    // so we need to apply it to sub-paths
    chain2(
      pipe6(
        groupBy(propOr4("unknown", "workspace")),
        toPairs2,
        map6(([workspace, commentedFiles]) => {
          const filesToWrite = map6((file) => {
            return writeFileWithAutoPath(
              pathJoin(
                outputDir,
                workspace,
                // this part is the structure of the file we wanna write
                cleanFilename(file)
              ),
              pipe6(
                map6(commentToMarkdown),
                (z) => ["# " + file.slugName, file.pageSummary, ...z],
                join3("\n\n")
              )(file.comments)
            );
          })(commentedFiles);
          const metaFiles = prepareMetaFiles(
            outputDir,
            workspace,
            commentedFiles
          );
          return filesToWrite.concat(metaFiles);
        }),
        flatten2,
        parallel(10)
      )
    ),
    // tell the user about it
    map6(K3(`Wrote to ${outputDir}/monodoc-generated.json`))
  )(pkgJson);
};
var { name: $NAME, description: $DESC } = package_default;
var monodoc = curry4(
  (cancel, argv) => pipe6(
    slice4(2, Infinity),
    configurate(
      YARGS_CONFIG,
      CONFIG_DEFAULTS,
      HELP_CONFIG,
      { name: $NAME, description: $DESC }
    ),
    chain2(processHelpOrRun)
  )(argv)
);

// src/executable.js
import { fork } from "fluture";
fork(console.error)(console.log)(monodoc(() => {
}, process.argv));
