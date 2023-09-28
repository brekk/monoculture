// src/cli.js
import { cwd } from "node:process";
import { basename as basename2, join as pathJoin, dirname } from "node:path";
import {
  fromPairs as fromPairs2,
  last as last4,
  applySpec as applySpec3,
  ap,
  prop as prop2,
  reduce as reduce3,
  includes as includes3,
  __,
  always as K3,
  chain as chain2,
  curry as curry5,
  defaultTo as defaultTo2,
  filter as filter3,
  flatten as flatten2,
  groupBy as groupBy2,
  head as head4,
  identity as I2,
  join as join3,
  length as length5,
  lt,
  map as map7,
  path,
  pathOr as pathOr3,
  pipe as pipe7,
  propOr as propOr4,
  replace as replace4,
  slice as slice4,
  sortBy as sortBy2,
  tap,
  toLower as toLower2,
  toPairs as toPairs3,
  toUpper
} from "ramda";
import { resolve, and as futureAnd, fork, parallel } from "fluture";
import {
  pathRelativeTo as pathRelativeTo2,
  readJSONFile,
  mkdirp,
  readDirWithConfig,
  writeFile,
  writeFileWithAutoPath
} from "file-system";

// src/stats.js
import {
  length,
  curry,
  pipe,
  groupBy,
  map,
  toPairs,
  sortBy,
  when,
  equals,
  always,
  head
} from "ramda";
var histogramBy = curry(
  (pred, list) => pipe(groupBy(pred), map(length), toPairs)(list)
);
var rarestBy = curry(
  (pred, list) => pipe(
    histogramBy(pred),
    (x) => x.sort(([_1, v], [_2, v2]) => v - v2),
    when(pipe(length, equals(0)), always([[]])),
    head,
    head
  )(list)
);

// src/parse.js
import { basename, extname } from "node:path";
import {
  curry as curry3,
  filter as filter2,
  flatten,
  head as head3,
  identity,
  last as last3,
  map as map5,
  mergeRight as mergeRight2,
  pathOr,
  pipe as pipe5,
  propOr as propOr2,
  uniq as uniq2
} from "ramda";
import { readFile, pathRelativeTo } from "file-system";

// src/file.js
import {
  addIndex,
  map as map2,
  match,
  pipe as pipe2,
  split,
  reduce,
  last,
  replace,
  init
} from "ramda";
var addLineNumbers = addIndex(map2)((a, i) => [i, a]);
var findJSDocKeywords = match(/@(\w*)/g);
var cleanupKeywords = pipe2(
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
  equals as equals2,
  length as length2,
  includes,
  join,
  map as map3,
  pipe as pipe3,
  replace as replace2,
  slice,
  split as split2,
  startsWith,
  trim,
  when as when2
} from "ramda";
var lines = split2("\n");
var unlines = join("\n");
var trimComment = pipe3(
  trim,
  when2(startsWith("* "), slice(2, Infinity))
);
var trimSummary = pipe3(
  reject(equals2("/**")),
  map3(trimComment),
  unlines
);
var nixKeyword = when2(includes("@"), replace2(/@/g, ""));
var wipeComment = pipe3(trimComment, nixKeyword);
var formatComment = (block) => pipe3(
  map3(([, v]) => v),
  map3(trimComment),
  slice(1, length2(block) - 1)
)(block);
var j2 = (x) => JSON.stringify(x, null, 2);
var stripRelative = replace2(/\.\.\//g, "");

// src/comment.js
import {
  toLower,
  split as split3,
  join as join2,
  propOr,
  prop,
  __ as $,
  addIndex as addIndex2,
  always as K,
  anyPass,
  applySpec,
  chain,
  cond,
  curry as curry2,
  defaultTo,
  either,
  equals as equals3,
  filter,
  fromPairs,
  head as head2,
  identity as I,
  ifElse,
  includes as includes2,
  last as last2,
  length as length3,
  map as map4,
  match as match2,
  mergeRight,
  objOf,
  pipe as pipe4,
  reduce as reduce2,
  reject as reject2,
  replace as replace3,
  slice as slice2,
  startsWith as startsWith2,
  toPairs as toPairs2,
  trim as trim2,
  uniq,
  when as when3
} from "ramda";
var linkRegex = /\{@link (.*)+\}/g;
var matchLinks = pipe4(
  chain(match2(linkRegex)),
  map4((z) => slice2("{@link ".length, z.length - 1, z))
);
var handleSpecificKeywords = curry2(
  (keyword, value, rest, file, end, i) => cond([
    // if example found, pull from raw file
    [equals3("example"), () => getExample(file, end, i)],
    // if see found, do some light cleanup
    [equals3("see"), () => pipe4(head2, slice2(0, -1))(rest)],
    // Consume pages + names as sentences
    [
      either(equals3("name"), equals3("page")),
      () => trim2(`${value} ${rest.join(" ")}`)
    ],
    // if an array value, concat it
    [() => rest.length, () => [value, ...rest]],
    // otherwise just return the value
    [K(true), () => value]
  ])(keyword)
);
var structureKeywords = curry2(
  (file, block, end) => pipe4(
    map4(([i, line]) => [
      i,
      ifElse(
        pipe4(findJSDocKeywords, length3, (z) => z > 0),
        pipe4(wipeComment, cleanupKeywords),
        K(false)
      )(line)
    ]),
    filter(last2),
    map4(([i, [keyword, value = true, ...rest]]) => [
      i,
      [keyword, handleSpecificKeywords(keyword, value, rest, file, end, i)]
    ]),
    map4(last2),
    // fromPairs truncates duplicate keys, so we have to arrayify them
    reduce2(
      (agg, [key, ...value]) => agg[key] && Array.isArray(agg[key]) ? { ...agg, [key]: agg[key].concat(value) } : { ...agg, [key]: value },
      {}
    ),
    toPairs2,
    map4(([k, v]) => [
      k,
      k !== "see" && Array.isArray(v) && v.length === 1 ? v[0] : v
    ]),
    fromPairs
  )(block)
);
var summarize = (lines2) => {
  const stripped = reject2(equals3("*"), lines2);
  return pipe4(
    addIndex2(map4)((x, i) => ifElse(startsWith2("@"), K(i), K(false))(x)),
    filter(I),
    head2,
    defaultTo(length3(stripped)),
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
var objectifyComments = curry2(
  (filename, file, comments) => reduce2(
    (agg, block) => agg.concat(
      pipe4(
        // pass one
        applySpec({
          start: pipe4(head2, head2),
          end: pipe4(last2, head2),
          lines: formatComment
        }),
        // pass two
        (gen) => {
          const structure = structureKeywords(file, block, gen.end);
          return {
            ...gen,
            summary: summarize(gen.lines),
            links: matchLinks(gen.lines),
            fileGroup: getFileGroup(structure),
            addTo: addTo(structure),
            structure,
            keywords: pipe4(unlines, findJSDocKeywords, uniq, (z) => z.sort())(
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
var getExample = curry2(
  (file, end, i) => pipe4(
    slice2(i + 1, end),
    map4(trimComment),
    map4(replace3(/^\*$/g, "")),
    unlines
  )(file)
);
var isJSDocComment = pipe4(
  trim2,
  anyPass([startsWith2("/**"), startsWith2("*"), startsWith2("*/")])
);

// src/parse.js
var getAny = curry3(
  (def, keyPath, comments) => pipe5(
    map5(pathOr(def, keyPath)),
    filter2(identity),
    uniq2,
    (x) => x.sort(),
    head3
  )(comments)
);
var parse = curry3((root, filename, content) => {
  const newName = stripRelative(filename);
  const newNameFolder = newName.slice(0, newName.lastIndexOf("/"));
  return pipe5(
    // String
    lines,
    // List String
    (raw) => pipe5(
      addLineNumbers,
      // List #[Integer, String]
      filter2(pipe5(last3, isJSDocComment)),
      // List #[Integer, String]
      groupContiguousBlocks,
      // List #[Integer, String]
      objectifyComments(newName, raw),
      // List CommentBlock
      (comments) => ({
        slugName: basename(newName, extname(newName)),
        filename: newName,
        comments,
        order: pipe5(
          getAny("0", ["structure", "order"]),
          (x) => parseInt(x, 10)
        )(comments),
        fileGroup: getAny("", ["fileGroup"], comments),
        links: pipe5(map5(propOr2([], "links")), flatten)(comments)
      })
    )(raw)
    // CommentedFile
  )(content);
});
var parseFile = curry3(
  (root, x) => pipe5(
    // String
    (filename) => pipe5(
      // String
      readFile,
      // Future<Error, String>
      map5(parse(root, filename)),
      // remove orphan comments (parser found it but its not well-formed)
      map5((p) => ({
        ...p,
        comments: pipe5(
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

// src/cli.js
import { scopedBinaryEffect } from "glue";

// src/renderer.js
import {
  ifElse as ifElse2,
  pipe as pipe6,
  applySpec as applySpec2,
  pathOr as pathOr2,
  propOr as propOr3,
  when as when4,
  startsWith as startsWith3,
  length as length4,
  always as K2,
  map as map6,
  slice as slice3
} from "ramda";
var stripFence = when4(startsWith3("```"), K2(""));
var liveExample = (ex) => pipe6(lines, map6(stripFence), slice3(1, length4(ex)), unlines)(ex);
var commentToMarkdown = ifElse2(
  // this is a special case where we want to be able to dynamically rename the page
  pathOr2(false, ["structure", "page"]),
  // but since we're cheating we don't want to list it as a comment
  K2(""),
  pipe6(
    applySpec2({
      title: pathOr2("Unknown", ["structure", "name"]),
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

// package.json
var package_default = {
  name: "monodoc",
  version: "0.0.1",
  description: "Magical documentation for monorepos",
  main: "monodoc.js",
  type: "module",
  repository: "brekk/monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  bin: {
    monodoc: "./monodoc-cli.js"
  },
  dependencies: {
    configurate: "*",
    "file-system": "*",
    fluture: "^14.0.0",
    ramda: "^0.29.0"
  },
  devDependencies: {
    dotenv: "^16.3.1",
    envtrace: "^0.0.2",
    "eslint-config-monoculture": "*",
    "jest-environment-jsdom": "^29.7.0",
    madge: "^6.0.0",
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

// src/config.js
import { curry as curry4 } from "ramda";
import { generateHelp } from "configurate";
import yargsParser from "yargs-parser";
var parser = curry4((opts, args) => yargsParser(args, opts));
var YARGS_CONFIG = {
  alias: {
    input: ["i"],
    output: ["o"],
    search: ["s"],
    artifact: ["a"],
    ignore: ["g"]
  },
  configuration: {
    "strip-aliased": true
  }
};
var HELP_CONFIG = {
  help: "This text!",
  input: "A file to read!",
  output: "The file to output!",
  search: "The glob to use for searching (default: '**//*.{js,jsx,ts,tsx}')",
  artifact: "Would you like to create an artifact file? (Useful for downstream transformation)",
  ignore: "Files to ignore when searching, can be specified multiple times"
};
var CONFIG_DEFAULTS = {
  ignore: [
    "**/node_modules/**",
    "**/coverage/**",
    "**/*.spec.{js,jsx,ts,tsx}",
    "**/*fixture.*",
    "**/fixture.*"
  ],
  search: "**/*.{js,jsx,ts,tsx}"
};
var HELP = generateHelp(package_default.name, HELP_CONFIG, YARGS_CONFIG);

// src/cli.js
var parsePackageName = (y) => {
  const slash = y.indexOf("/");
  const start = slash + 1;
  const end = y.indexOf("/", start);
  return y.slice(start, end);
};
var capitalToKebab = (s) => pipe7(
  replace4(/\//g, "-"),
  replace4(/--/g, "-")
)(s.replace(/[A-Z]/g, (match3) => `-` + match3));
var readPackageJsonWorkspaces = curry5(
  (root, x) => map7(
    pipe7(
      // grab the workspaces field
      propOr4([], "workspaces"),
      // we want directories only
      map7((z) => `${z}/`),
      // read all the directories
      map7(readDirWithConfig({ cwd: root }))
    )
  )(x)
);
var iterateOverWorkspacesAndReadFiles = curry5(
  (searchGlob, ignore, root, x) => map7(
    pipe7(
      // look for specific file types
      map7((workspace) => workspace + searchGlob),
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
var pullPageTitleFromAnyComment = pipe7(
  filter3(pathOr3(false, ["structure", "page"])),
  map7(path(["structure", "page"])),
  head4,
  defaultTo2(""),
  replace4(/\s/g, "-"),
  defaultTo2(false)
);
var capitalize = (raw) => `${toUpper(raw[0])}${slice4(1, Infinity)(raw)}`;
var cleanFilename = ({ workspace, fileGroup, filename, comments }) => {
  const title = pullPageTitleFromAnyComment(comments);
  const sliced = title || slug(filename);
  const result = capitalToKebab(sliced) + ".mdx";
  return (fileGroup ? fileGroup + "/" : "") + stripLeadingHyphen(sliced !== title ? capitalize(result) : result);
};
var combineFiles = curry5(
  (leftToRight, a, b) => !leftToRight ? combineFiles(true, b, a) : {
    ...a,
    ...b,
    comments: [...a.comments, ...b.comments],
    links: [...a.links, ...b.links]
  }
);
var prepareMetaFiles = curry5(
  (outputDir, workspace, commentedFiles) => pipe7(
    map7((raw) => [
      pipe7(cleanFilename, (x) => basename2(x, ".mdx"))(raw),
      pipe7(
        propOr4([], "comments"),
        filter3(pathOr3(false, ["structure", "name"])),
        head4,
        applySpec3({
          order: pipe7(
            pathOr3("0", ["structure", "order"]),
            (x) => parseInt(x, 10)
          ),
          group: pathOr3("", ["structure", "group"]),
          name: pipe7(pathOr3("???", ["structure", "name"]))
        })
      )(raw)
    ]),
    groupBy2(pipe7(last4, propOr4("", "group"))),
    map7(
      pipe7(
        sortBy2(pathOr3(0, ["order"])),
        map7(([title, { name }]) => [
          pipe7(capitalToKebab, stripLeadingHyphen)(title),
          name
        ]),
        fromPairs2
      )
    ),
    toPairs3,
    map7(
      ([folder, data]) => writeFileWithAutoPath(
        pathJoin(outputDir, workspace, folder, "_meta.json"),
        JSON.stringify(data, null, 2)
      )
    )
  )(commentedFiles)
);
var processHelpOrRun = (x) => x.help || !x.input || !x.output ? resolve(HELP) : runner(x);
var runner = ({
  input,
  output,
  search: searchGlob = CONFIG_DEFAULTS.search,
  ignore = CONFIG_DEFAULTS.ignore,
  artifact = false
}) => {
  const current = cwd();
  const rel = pathRelativeTo2(current);
  const [pkgJson, outputDir, relativeArtifact] = map7(rel, [
    input,
    output,
    artifact
  ]);
  const root = pkgJson.slice(0, pkgJson.lastIndexOf("/"));
  const toLocal = input.slice(0, input.lastIndexOf("/"));
  const relativize = (r) => toLocal + "/" + r;
  return pipe7(
    // read the package.json file
    readJSONFile,
    // reach into the Future
    readPackageJsonWorkspaces(root),
    // take the Future of an array of Futures, make it a single Future
    chain2(parallel(10)),
    // take [[apps/workspace, apps/workspace2], [scripts/workspace]]
    // and make them [apps/workspace, apps/workspace2, scripts/workspace]
    map7(flatten2),
    // let's add globs
    iterateOverWorkspacesAndReadFiles(searchGlob, ignore, root),
    // Future<error, Future<error, string>[]>
    chain2(parallel(10)),
    // Future<error, string[]>
    // take [[files, in], [workspaces]] and make them [files, in, workspaces]
    map7(flatten2),
    map7(map7(relativize)),
    // check each file for comments
    // Future<error, Future<error, CommentBlock>[]>
    map7(chain2(parseFile(root))),
    // Future<error, CommentBlock[]>
    chain2(parallel(10)),
    // Future<error, CommentBlock[]>
    // exclude any files which don't have any comments
    map7(filter3(pipe7(propOr4([], "comments"), length5, lt(0)))),
    map7(
      map7((raw) => {
        const filename = stripRelative(raw.filename);
        return {
          ...raw,
          comments: raw.comments.map((r) => ({ ...r, filename })),
          filename,
          workspace: parsePackageName(filename)
        };
      })
    ),
    map7(
      reduce3((agg, file) => {
        const filenames = map7(prop2("filename"), agg);
        const alreadyInList = filenames.includes(file.filename);
        const anyFile = file.comments.filter(
          ({ structure }) => structure.asFile
        );
        const someFile = anyFile.length > 0 ? anyFile[0] : false;
        const asFilePath = pipe7(
          defaultTo2({}),
          pathOr3("???", ["structure", "asFile"])
        )(someFile);
        const withOrder = pipe7(
          pathOr3("0", ["structure", "order"]),
          (x) => parseInt(x, 10)
        )(someFile);
        const dir = dirname(file.filename);
        const newFile = someFile ? pathJoin(dir, asFilePath) : "???";
        return alreadyInList ? map7((raw) => {
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
        (content) => pipe7(
          // (as JSON)
          j2,
          writeFile(relativeArtifact),
          // but persist our original content for downstream consumption
          map7(K3(content))
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
      pipe7(
        groupBy2(propOr4("unknown", "workspace")),
        toPairs3,
        map7(([workspace, commentedFiles]) => {
          const filesToWrite = map7((file) => {
            return writeFileWithAutoPath(
              pathJoin(
                outputDir,
                workspace,
                // this part is the structure of the file we wanna write
                cleanFilename(file)
              ),
              pipe7(
                map7(commentToMarkdown),
                (z) => ["# " + file.slugName, ...z],
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
    map7(K3(`Wrote to ${outputDir}/monodoc-generated.json`))
  )(pkgJson);
};
var monodoc = pipe7(
  slice4(2, Infinity),
  parser(YARGS_CONFIG),
  processHelpOrRun
);

// src/executable.js
import { fork as fork2 } from "fluture";
fork2(console.error)(console.log)(monodoc(process.argv));
