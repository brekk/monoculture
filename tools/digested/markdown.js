import { isNotEmpty } from 'inherent'

import { unlines, strepeat } from 'knot'
import { map, pipe, keys, toPairs, when, always as K, curry } from 'ramda'
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
            name,
            documentation: docs = [],
            description,
          } = entry
          const indent = 3
          const iDisclose = disclosable(indent)
          const dependencyMap =
            '\n' +
            iDisclose(
              'Dependencies',
              ` - ${depUsage(indent, { repo, project: name }, deps, devDeps)}`
            )
          const apiContent = docLinks(indent, pagesURL, name, docs)
          const docMap = apiContent ? iDisclose('API', apiContent) : ''
          const docsAndDeps =
            showDeps && isNotEmpty(keys({ ...deps, ...devDeps }))
              ? `${docMap ? '\n' + docMap : ''}${dependencyMap}\n`
              : '\n'
          return `[${name}](${repo}/${group}/${name}) - ${description}${docsAndDeps}`
        }),
        projects =>
          `## ${group}\n\n${projects
            .map(z => ' * ' + z)
            .join(showDeps ? '\n' : '')}`
      )(list)
    ),
    unlines,
    when(K(raw.banner), y => raw.banner.replace(/\\n/g, '\n') + '\n' + y)
  )(raw.grouped)
)
