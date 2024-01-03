import { dirname, join as pathJoin } from 'node:path'
import {
  mergeRight,
  startsWith,
  always as K,
  curry,
  map,
  filter,
  pipe,
  propOr,
  reduce,
  concat,
  groupBy,
  head,
  chain,
  when,
  objOf,
} from 'ramda'
import { log } from './log'
import { parallel, resolve } from 'fluture'
import { readDirWithConfig, relativePathJoin, readFile } from 'file-system'
import { renderReadme } from './markdown'

const processWorkspace = curry(
  function _processWorkspace(banner, bannerPath, drGenPath, workspaces) {
    const readables = []
    if (drGenPath) {
      log.summary('reading doctor-general path', drGenPath)
      readables.push(
        pipe(readFile, map(JSON.parse), map(objOf('drGen')))(drGenPath)
      )
    }
    if (!banner && bannerPath) {
      log.summary('reading banner path', bannerPath)
      readables.push(pipe(readFile, map(objOf('banner')))(bannerPath))
    }
    return readables.length
      ? pipe(
          parallel(10),
          map(reduce((agg, x) => mergeRight(agg, x), { workspaces, banner }))
        )(readables)
      : resolve({ banner: banner || '', drGen: [], workspaces })
  }
)

const getWorkspaceGroupFromPath = pathName => {
  let y = pathName
  const isLocal = startsWith('./')
  const isParent = startsWith('..')
  while (isLocal(y)) {
    y = y.slice(2)
  }
  while (isParent(y)) {
    y = y.slice(3)
  }
  return y.slice(0, y.indexOf('/'))
}

const processPackage = ({ drGen, workspaces, banner }) =>
  pipe(
    map(pathName => {
      const group = getWorkspaceGroupFromPath(pathName)
      return pipe(
        z => pathJoin(z, 'package.json'),
        readFile,
        map(JSON.parse),
        map(raw => ({
          ...raw,
          group,
          documentation: filter(
            doc => doc.filename.startsWith(group),
            drGen ?? []
          ),
        }))
      )(pathName)
    }),
    parallel(10),
    map(
      pipe(
        map(pipe(({ group, ...z }) => [group, z])),
        groupBy(head),
        map(map(([_k, g]) => g))
      )
    ),
    map(grouped => ({ banner, grouped }))
  )(workspaces)

/* eslint-disable jsdoc/no-multi-asterisks */
/* eslint-disable max-len */
/**
 * Summarize a project, given:
 *  - the path to a `package.json` file
 *  - the path to a `dr-generated.json` file
 *  - the URI of a documentation site
 *  - the URI of a repository
 *  - (optional) a banner
 *  - or (optional) the path to a file which represents a banner
 * @name summarize
 * @future
 * @example
 * ```js test=true
 * import path from 'node:path'
 * import { fork } from 'fluture'
 * // drgen-import-above
 * fork(done)(x => {
 *   expect(x.split('\n')).toEqual([
 *     "this is a cool test!",
 *     "## apps",
 *     "",
 *     " * [docs](//repo.biz/apps/docs) - documentation site for monoculture",
 *     "",
 *     "## packages",
 *     "",
 *     " * [bloodline](//repo.biz/packages/bloodline) - determine the relationships between files 🩸",
 *     " * [climate](//repo.biz/packages/climate) - CLI utilities, friend 👯",
 *     " * [climate-json](//repo.biz/packages/climate-json) - JSON parser for climate 🐐",
 *     " * [climate-toml](//repo.biz/packages/climate-toml) - TOML parser for climate 🍅",
 *     " * [climate-yaml](//repo.biz/packages/climate-yaml) - YAML parser for climate 🍠",
 *     " * [clox](//repo.biz/packages/clox) - boxes for the terminal ⏰",
 *     " * [doctor-general](//repo.biz/packages/doctor-general) - documentation generation 🩻",
 *     " * [doctor-general-jest](//repo.biz/packages/doctor-general-jest) - documentation generation - jest 🃏",
 *     " * [doctor-general-mdx](//repo.biz/packages/doctor-general-mdx) - documentation generation - mdx 🩺",
 *     " * [file-system](//repo.biz/packages/file-system) - fs, but in the future 🔮",
 *     " * [inherent](//repo.biz/packages/inherent) - functional utilities for primitives ⛺️",
 *     " * [kiddo](//repo.biz/packages/kiddo) - child processes in the future 👶",
 *     " * [knot](//repo.biz/packages/knot) - functional utilities for strings 🪢",
 *     " * [monocle](//repo.biz/packages/monocle) - inspect code and apply rules, magically 🧐",
 *     " * [monorail](//repo.biz/packages/monorail) - plugins for smug grins 🚂",
 *     " * [robot-tourist](//repo.biz/packages/robot-tourist) - human-centric source code interpreter 🤖",
 *     " * [water-wheel](//repo.biz/packages/water-wheel) - future-wrapping for streaming interfaces 🌊",
 *     "",
 *     "## shared",
 *     "",
 *     " * [eslint-config-monoculture](//repo.biz/shared/eslint-config-monoculture) - shared eslint configuration for monoculture packages 🧹",
 *     " * [jest-config](//repo.biz/shared/jest-config) - shared jest configuration for monoculture packages 🎪",
 *     " * [monoculture-tsconfig](//repo.biz/shared/monoculture-tsconfig) - shared tsconfig for monoculture packages 😵",
 *     "",
 *     "## tools",
 *     "",
 *     " * [digested](//repo.biz/tools/digested) - summarize and automatically generate information about your projects 🍽️",
 *     " * [doctor-general-cli](//repo.biz/tools/doctor-general-cli) - documentation generation in a nice CLI 🫡",
 *     " * [gitparty](//repo.biz/tools/gitparty) - visualize git logs with magical context 🎨",
 *     " * [spacework](//repo.biz/tools/spacework) - meta tools for monoculture ☄️",
 *     " * [superorganism](//repo.biz/tools/superorganism) - script runner from beyond the moon 🐁",
 *     " * [treacle](//repo.biz/tools/treacle) - command line interface tree visualization pun 🫠",
 *     "",
 *   ])
 *   done()
 * })(summarize({
 *   readme: true,
 *   dirPath: process.cwd(),
 *   banner: 'this is a cool test!',
 *   // repoUrl: 'https://github.com/brekk/monoculture/tree/main',
 *   // docUrl: 'https://brekk.github.io/monoculture',
 *   // base package only!
 *   repoUrl: '//repo.biz',
 *   docUrl: '//repo.doc',
 *   pkgPath: '../../package.json',
 *   drGenPath: '../../apps/docs/dr-generated.json'
 * }))
 * ```
 */
export const summarize = config => {
  const {
    repoUrl,
    pkgPath,
    drGenPath,
    deps,
    readme,
    docUrl,
    help = false,
    banner,
    bannerPath,
    HELP,
  } = config
  const dirPath = dirname(pkgPath)
  return help
    ? HELP
    : pipe(
        readFile,
        map(pipe(JSON.parse, propOr([], 'workspaces'))),
        map(map(relativePathJoin(dirPath))),
        map(
          map(
            readDirWithConfig({
              onlyDirectories: true,
            })
          )
        ),
        chain(parallel(10)),
        map(reduce(concat, [])),
        chain(processWorkspace(banner, bannerPath, drGenPath)),
        chain(processPackage),
        map(when(K(readme), renderReadme(repoUrl, deps, docUrl)))
      )(pkgPath)
}
