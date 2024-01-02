#!/usr/bin/env node

// eslint-disable-next-line max-len
// cat package.json | snang --require "scripts:./package-scripts.cjs" -iP "omit(['scripts']) | mergeRight({scripts: pipe(propOr({}, 'scripts'), keys)(scripts)})" -o

const { argv, cwd } = require('node:process')
const path = require('node:path')
const { writeFile: writeFileRaw } = require('node:fs')

const {
  F,
  __: $,
  always,
  chain,
  concat,
  curry,
  fork,
  fromPairs,
  j2,
  keys,
  map,
  mergeRight,
  omit,
  pipe,
  propOr,
  readFile,
  reduce,
  replace,
  split,
  toPairs,
  unless,
  ifElse,
  is,
} = require('snang/script')

const NPS = `dotenv -- nps -c ./package-scripts.cjs`

const writeFile = curry(function _writeFile(handle, value) {
  return new F.Future((bad, good) => {
    writeFileRaw(handle, value, 'utf8', err => {
      if (err) {
        bad(err)
      } else {
        good(value)
      }
    })
    return () => {}
  })
})

const consumeScripts = pipe(
  propOr({}, 'scripts'),
  toPairs,
  reduce(
    (agg, [k, v]) =>
      concat(
        agg,
        concat(
          pipe(
            ifElse(
              is(String),
              always([k]),
              pipe(
                omit(['script', 'description']),
                keys,
                map(z => `${k}:${z}`)
              )
            )
          )(v),
          [k]
        )
      ),
    []
  ),
  z => z.sort(),
  map(z => [z, `${NPS} ${replace(/:/g, '.', z)}`]),
  concat([['nps', NPS]]),
  fromPairs
)

const process = curry(function _process(rawPkg, rawScripts) {
  return pipe(
    omit(['scripts']),
    mergeRight($, { scripts: consumeScripts(rawScripts) }),
    j2,
    z => z + '\n'
  )(rawPkg)
})

const relative = x => path.resolve(cwd(), x)

const futureRequire = pipe(relative, require, F.resolve)

module.exports = pipe(
  ([json, scripts]) =>
    pipe(
      F.parallel(10),
      map(([p, s]) => process(JSON.parse(p), s)),
      chain(writeFile(json)),
      map(always(`Updated the scripts in ${json} file!`))
    )([readFile(json), futureRequire(scripts)]),
  // eslint-disable-next-line no-console
  fork(console.error, console.log)
)(argv.slice(2))
