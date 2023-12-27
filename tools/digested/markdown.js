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
          const indent = 3
          const iDisclose = disclosable(indent)
          const dependencyMap =
            '\n' +
            iDisclose(
              'Dependencies',
              ` - ${depUsage(indent, { repo, project }, deps, devDeps)}`
            )
          const docMap = docs.length
            ? iDisclose('API', docLinks(indent, pagesURL, project, docs))
            : ''
          const docsAndDeps =
            showDeps && isNotEmpty(keys({ ...deps, ...devDeps }))
              ? `${docMap ? '\n' + docMap : ''}${dependencyMap}\n`
              : '\n'
          return `[${project}](${repo}/${group}/${project}) - ${summary}${docsAndDeps}`
        }),
        projects =>
          `## ${group}\n\n${projects
            .map(z => ' * ' + z)
            .join(showDeps ? '\n' : '')}`
      )(list)
    ),
    unlines
  )(raw)
)
