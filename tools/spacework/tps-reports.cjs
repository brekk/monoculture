#!/usr/bin/env node
const IST = require('istanbul-lib-coverage')
const path = require('node:path')
const {
  values,
  trace,
  j2,
  forEach,
  chain,
  F,
  objOf,
  mergeRight,
  fork,
  lines,
  map,
  pipe,
  readDirWithConfig,
  readFile,
  split,
} = require('snang/script')

const cleanCover = fileCoverage => {
  fileCoverage.path = fileCoverage.path.replace(
    /(.*packages\/.*\/)(build)(\/.*)/,
    '$1src$3'
  )
  return fileCoverage
}

const CWD = process.cwd()
const runner = args => {
  return pipe(
    readDirWithConfig({ ignore: '**/node_modules/**' }),
    chain(
      pipe(
        map(reportPath => {
          const lookup = path.relative(
            CWD,
            reportPath.slice(0, reportPath.lastIndexOf('/'))
          )
          const [group, workspace] = split(path.sep, lookup)
          return pipe(
            readFile,
            map(
              pipe(
                JSON.parse,
                objOf('report'),
                mergeRight({
                  group,
                  workspace,
                })
              )
            )
          )(reportPath)
        }),
        F.parallel(10)
      )
    ),
    map(raw => {
      const antinople = IST.createCoverageMap()
      forEach(
        content =>
          pipe(
            values,
            forEach(file => antinople.addFileCoverage(file))
          )(content.report.coverageMap),
        raw
      )
      return JSON.stringify(antinople)
    })
  )(args)
}

fork(console.error, console.log)(runner(path.join(CWD, './**/ci-report.json')))
