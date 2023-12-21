// src/index.js
import { curry, join, pipe, range, reduce, split } from "ramda";

// src/constants.js
var NEWLINE = "\n";
var TAB = "	";
var EMPTY = "";
var SPACE = " ";
var AMPERSAND = "&";
var AND = AMPERSAND + AMPERSAND;

// src/index.js
var makeSplitJoinPair = (z) => [split(z), join(z)];
var [words, unwords] = makeSplitJoinPair(SPACE);
var [lines, unlines] = makeSplitJoinPair(NEWLINE);
var [chars, unchars] = makeSplitJoinPair(EMPTY);
var [tabs, untabs] = makeSplitJoinPair(TAB);
var prepend = curry((pre, x) => `${pre}${x}`);
var append = curry((post, x) => `${x}${post}`);
var cake = curry(
  (bottom, top, layer, x) => pipe(join(layer), prepend(top), append(bottom))(x)
  // `${top}${join(layer, x)}${bottom}`
);
var MARKDOWN_LIST_ITEM = " - ";
var markdownTabs = cake(
  NEWLINE,
  `
${MARKDOWN_LIST_ITEM}`,
  MARKDOWN_LIST_ITEM
);
var nthIndexOf = curry(
  (delim, n, input) => pipe(
    range(0),
    reduce((x, _) => input.indexOf(delim, x + 1), -1),
    (z) => input.slice(0, z)
  )(n)
);
var nthLastIndexOf = curry(
  (delim, n, input) => pipe(
    range(0),
    reduce((x, _) => input.lastIndexOf(delim, x - 1), input.length),
    (z) => input.slice(z + 1)
  )(Math.abs(n))
);
var nthIndex = curry(
  (delim, n, input) => (n > 0 ? nthIndexOf : nthLastIndexOf)(delim, n, input)
);
export {
  append,
  cake,
  chars,
  lines,
  markdownTabs,
  nthIndex,
  nthIndexOf,
  nthLastIndexOf,
  prepend,
  tabs,
  unchars,
  unlines,
  untabs,
  unwords,
  words
};
