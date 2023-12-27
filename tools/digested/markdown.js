import { j2, isNotEmpty } from 'inherent'

import { unlines, strepeat } from 'knot'
import { map, pipe, keys, toPairs, curry } from 'ramda'
import { depUsage, docLinks } from './link'

export const disclosable = curry((indent, title, content) => {
  const i = strepeat(' ', indent)
  return `
${i}<details><summary>${title}</summary>

${i}${content}

${i}</details>`
})

// const pagesURL = pagesForGithub(repo)
export const renderReadme = curry((repo, showDeps, pagesURL, raw) =>
  pipe(
    toPairs,
    map(([group, list]) =>
      pipe(
        map(entry => {
          const {
            dependencies: deps,
            devDependencies: devDeps,
            name: project,
            documentation: docs = [],
            description: summary,
          } = entry
          const iDisclose = disclosable(5)
          const dependencyMap =
            '\n' +
            iDisclose(
              'Dependencies',
              ` - ${depUsage({ repo, project }, deps, devDeps)}`
            )
          const docMap = docs.length
            ? iDisclose('API', docLinks(5, pagesURL, project, docs))
            : ''
          const docsAndDeps =
            showDeps && isNotEmpty(keys({ ...deps, ...devDeps }))
              ? `${docMap ? docMap + '\n' : ''}${dependencyMap}\n`
              : '\n'
          return `[${project}](${repo}/${group}/${project}) - ${summary}${docsAndDeps}`
        }),
        projects =>
          `\n## ${group}\n\n${projects
            .map(z => '   * ' + z)
            .join(showDeps ? '\n' : '')}`
      )(list)
    ),
    unlines
  )(raw)
)
