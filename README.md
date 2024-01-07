# monoculture

introspection and organization tools for monorepos

*Dependency legend*:

 - 🦴 package from within this monorepo
 - 🧪 package used as a devDependency

## apps

 * [docs](https://github.com/brekk/monoculture/tree/main/apps/docs) - documentation site for monoculture

   <details><summary>Dependencies</summary>

    - [@chakra-ui/react](https://www.npmjs.com/package/@chakra-ui/react)
    - [@chakra-ui/system](https://www.npmjs.com/package/@chakra-ui/system)
    - [@emotion/react](https://www.npmjs.com/package/@emotion/react)
    - [@emotion/styled](https://www.npmjs.com/package/@emotion/styled)
    - [@fortawesome/fontawesome-svg-core](https://www.npmjs.com/package/@fortawesome/fontawesome-svg-core)
    - [@fortawesome/free-regular-svg-icons](https://www.npmjs.com/package/@fortawesome/free-regular-svg-icons)
    - [@fortawesome/free-solid-svg-icons](https://www.npmjs.com/package/@fortawesome/free-solid-svg-icons)
    - [@fortawesome/react-fontawesome](https://www.npmjs.com/package/@fortawesome/react-fontawesome)
    - [@mdi/js](https://www.npmjs.com/package/@mdi/js)
    - [framer-motion](https://www.npmjs.com/package/framer-motion)
    - [next](https://www.npmjs.com/package/next)
    - [nextra](https://www.npmjs.com/package/nextra)
    - [nextra-theme-docs](https://www.npmjs.com/package/nextra-theme-docs)
    - [react](https://www.npmjs.com/package/react)
    - [react-dom](https://www.npmjs.com/package/react-dom)
    - [@babel/core](https://www.npmjs.com/package/@babel/core) 🧪
    - [@testing-library/dom](https://www.npmjs.com/package/@testing-library/dom) 🧪
    - [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) 🧪
    - [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) 🧪
    - [@testing-library/user-event](https://www.npmjs.com/package/@testing-library/user-event) 🧪
    - [@types/jest](https://www.npmjs.com/package/@types/jest) 🧪
    - [@types/react](https://www.npmjs.com/package/@types/react) 🧪
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [doctor-general-mdx](https://github.com/brekk/monoculture/tree/main/packages/doctor-general-mdx) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint](https://www.npmjs.com/package/eslint) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [eslint-plugin-next](https://www.npmjs.com/package/eslint-plugin-next) 🧪
    - [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier) 🧪
    - [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) 🧪
    - [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-environment-jsdom](https://www.npmjs.com/package/jest-environment-jsdom) 🧪
    - [monoculture-tsconfig](https://github.com/brekk/monoculture/tree/main/shared/monoculture-tsconfig) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [prettier](https://www.npmjs.com/package/prettier) 🧪
    - [typescript](https://www.npmjs.com/package/typescript) 🧪

   </details>

## packages

 * [bloodline](https://github.com/brekk/monoculture/tree/main/packages/bloodline) - determine the relationships between files 🩸

   <details><summary>API</summary>

    - [executables](https://brekk.github.io/monoculture/bloodline/executables)
    - [tree](https://brekk.github.io/monoculture/bloodline/tree)

   </details>

   <details><summary>Dependencies</summary>

    - [chalk](https://www.npmjs.com/package/chalk)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [dependency-tree](https://www.npmjs.com/package/dependency-tree)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) 🦴
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴
    - [precinct](https://www.npmjs.com/package/precinct)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [ts-graphviz](https://www.npmjs.com/package/ts-graphviz)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) - CLI utilities, friend 👯

   <details><summary>API</summary>

    - [builder](https://brekk.github.io/monoculture/climate/builder)

   </details>

   <details><summary>Dependencies</summary>

    - [chalk](https://www.npmjs.com/package/chalk)
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint](https://www.npmjs.com/package/eslint) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier) 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [prettier](https://www.npmjs.com/package/prettier) 🧪
    - [smol-toml](https://www.npmjs.com/package/smol-toml) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪

   </details>

 * [climate-json](https://github.com/brekk/monoculture/tree/main/packages/climate-json) - JSON parser for climate 🐐

   <details><summary>Dependencies</summary>

    - [ramda](https://www.npmjs.com/package/ramda)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [fluture](https://www.npmjs.com/package/fluture) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [climate-toml](https://github.com/brekk/monoculture/tree/main/packages/climate-toml) - TOML parser for climate 🍅

   <details><summary>Dependencies</summary>

    - [ramda](https://www.npmjs.com/package/ramda)
    - [smol-toml](https://www.npmjs.com/package/smol-toml)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [fluture](https://www.npmjs.com/package/fluture) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [climate-yaml](https://github.com/brekk/monoculture/tree/main/packages/climate-yaml) - YAML parser for climate 🍠

   <details><summary>Dependencies</summary>

    - [ramda](https://www.npmjs.com/package/ramda)
    - [yaml](https://www.npmjs.com/package/yaml)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [fluture](https://www.npmjs.com/package/fluture) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [clox](https://github.com/brekk/monoculture/tree/main/packages/clox) - boxes for the terminal ⏰

   <details><summary>Dependencies</summary>

    - [ansi-align](https://www.npmjs.com/package/ansi-align)
    - [camelcase](https://www.npmjs.com/package/camelcase)
    - [chalk](https://www.npmjs.com/package/chalk)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [string-length](https://www.npmjs.com/package/string-length)
    - [widest-line](https://www.npmjs.com/package/widest-line)
    - [wrap-ansi](https://www.npmjs.com/package/wrap-ansi)
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [doctor-general](https://github.com/brekk/monoculture/tree/main/packages/doctor-general) - documentation generation 🩻

   <details><summary>API</summary>

    - [comment-test](https://brekk.github.io/monoculture/doctor-general-jest/comment-test)
    - [comment](https://brekk.github.io/monoculture/doctor-general/comment)
    - [processor](https://brekk.github.io/monoculture/doctor-general/processor)
    - [text](https://brekk.github.io/monoculture/doctor-general/text)

   </details>

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) 🦴
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [envtrace](https://www.npmjs.com/package/envtrace) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-environment-jsdom](https://www.npmjs.com/package/jest-environment-jsdom) 🧪
    - [madge](https://www.npmjs.com/package/madge) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪
    - [xtrace](https://www.npmjs.com/package/xtrace) 🧪

   </details>

 * [doctor-general-jest](https://github.com/brekk/monoculture/tree/main/packages/doctor-general-jest) - documentation generation - jest 🃏

   <details><summary>API</summary>

    - [comment-test](https://brekk.github.io/monoculture/doctor-general-jest/comment-test)

   </details>

   <details><summary>Dependencies</summary>

    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [envtrace](https://www.npmjs.com/package/envtrace) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-environment-jsdom](https://www.npmjs.com/package/jest-environment-jsdom) 🧪
    - [madge](https://www.npmjs.com/package/madge) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪
    - [xtrace](https://www.npmjs.com/package/xtrace) 🧪

   </details>

 * [doctor-general-mdx](https://github.com/brekk/monoculture/tree/main/packages/doctor-general-mdx) - documentation generation - mdx 🩺

   <details><summary>Dependencies</summary>

    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [envtrace](https://www.npmjs.com/package/envtrace) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-environment-jsdom](https://www.npmjs.com/package/jest-environment-jsdom) 🧪
    - [madge](https://www.npmjs.com/package/madge) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪
    - [xtrace](https://www.npmjs.com/package/xtrace) 🧪

   </details>

 * [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) - fs, but in the future 🔮

   <details><summary>API</summary>

    - [fs](https://brekk.github.io/monoculture/file-system/fs)

   </details>

   <details><summary>Dependencies</summary>

    - [find-up](https://www.npmjs.com/package/find-up)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) - functional utilities for primitives ⛺️

   <details><summary>API</summary>

    - [groupByIndex](https://brekk.github.io/monoculture/inherent/groupByIndex)
    - [primitives](https://brekk.github.io/monoculture/inherent/primitives)

   </details>

   <details><summary>Dependencies</summary>

    - [ramda](https://www.npmjs.com/package/ramda)
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) - child processes in the future 👶

   <details><summary>API</summary>

    - [kiddo](https://brekk.github.io/monoculture/kiddo/kiddo)

   </details>

   <details><summary>Dependencies</summary>

    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [execa](https://www.npmjs.com/package/execa)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [ora](https://www.npmjs.com/package/ora)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) - functional utilities for strings 🪢

   <details><summary>API</summary>

    - [knot](https://brekk.github.io/monoculture/knot/knot)

   </details>

   <details><summary>Dependencies</summary>

    - [chalk](https://www.npmjs.com/package/chalk)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [manacle](https://github.com/brekk/monoculture/tree/main/packages/manacle) - make conventions into rules, magically 🔒

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [climate-json](https://github.com/brekk/monoculture/tree/main/packages/climate-json) 🦴
    - [climate-toml](https://github.com/brekk/monoculture/tree/main/packages/climate-toml) 🦴
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴
    - [monorail](https://github.com/brekk/monoculture/tree/main/packages/monorail) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [execa](https://www.npmjs.com/package/execa) 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [monocle](https://github.com/brekk/monoculture/tree/main/packages/monocle) - inspect code and apply rules, magically 🧐

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [climate-json](https://github.com/brekk/monoculture/tree/main/packages/climate-json) 🦴
    - [climate-toml](https://github.com/brekk/monoculture/tree/main/packages/climate-toml) 🦴
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [monorail](https://github.com/brekk/monoculture/tree/main/packages/monorail) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [execa](https://www.npmjs.com/package/execa) 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [knot](https://github.com/brekk/monoculture/tree/main/packages/knot) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [robot-tourist](https://github.com/brekk/monoculture/tree/main/packages/robot-tourist) 🦴 🧪

   </details>

 * [monorail](https://github.com/brekk/monoculture/tree/main/packages/monorail) - plugins for smug grins 🚂

   <details><summary>API</summary>

    - [helpers](https://brekk.github.io/monoculture/monorail/helpers)

   </details>

   <details><summary>Dependencies</summary>

    - [@hapi/topo](https://www.npmjs.com/package/@hapi/topo)
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [unusual](https://www.npmjs.com/package/unusual) 🧪

   </details>

 * [robot-tourist](https://github.com/brekk/monoculture/tree/main/packages/robot-tourist) - human-centric source code interpreter 🤖

   <details><summary>Dependencies</summary>

    - [change-case](https://www.npmjs.com/package/change-case)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [stemmer](https://www.npmjs.com/package/stemmer)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint](https://www.npmjs.com/package/eslint) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest](https://www.npmjs.com/package/jest) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [prettier](https://www.npmjs.com/package/prettier) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪

   </details>

 * [water-wheel](https://github.com/brekk/monoculture/tree/main/packages/water-wheel) - future-wrapping for streaming interfaces 🌊

   <details><summary>Dependencies</summary>

    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [get-stream](https://www.npmjs.com/package/get-stream)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [into-stream](https://www.npmjs.com/package/into-stream) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

## shared

 * [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) - shared eslint configuration for monoculture packages 🧹

   <details><summary>Dependencies</summary>

    - [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
    - [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)
    - [eslint](https://www.npmjs.com/package/eslint)
    - [eslint-config-next](https://www.npmjs.com/package/eslint-config-next)
    - [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
    - [eslint-config-turbo](https://www.npmjs.com/package/eslint-config-turbo)
    - [eslint-plugin-babel](https://www.npmjs.com/package/eslint-plugin-babel)
    - [eslint-plugin-fp](https://www.npmjs.com/package/eslint-plugin-fp)
    - [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)
    - [eslint-plugin-jsdoc](https://www.npmjs.com/package/eslint-plugin-jsdoc)
    - [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
    - [eslint-plugin-ramda](https://www.npmjs.com/package/eslint-plugin-ramda)
    - [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react)
    - [eslint-plugin-unused-imports](https://www.npmjs.com/package/eslint-plugin-unused-imports)
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [prettier](https://www.npmjs.com/package/prettier) 🧪
    - [typescript](https://www.npmjs.com/package/typescript) 🧪

   </details>

 * [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) - shared jest configuration for monoculture packages 🎪

   <details><summary>Dependencies</summary>

    - [@swc/core](https://www.npmjs.com/package/@swc/core)
    - [@swc/jest](https://www.npmjs.com/package/@swc/jest)
    - [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom)
    - [jest](https://www.npmjs.com/package/jest)
    - [ts-jest-resolver](https://www.npmjs.com/package/ts-jest-resolver)
    - [typescript](https://www.npmjs.com/package/typescript)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪

   </details>

 * [monoculture-tsconfig](https://github.com/brekk/monoculture/tree/main/shared/monoculture-tsconfig) - shared tsconfig for monoculture packages 😵

   <details><summary>Dependencies</summary>

    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

## tools

 * [digested](https://github.com/brekk/monoculture/tree/main/tools/digested) - summarize and automatically generate information about your projects 🍽️

   <details><summary>API</summary>

    - [summary](https://brekk.github.io/monoculture/digested/summary)

   </details>

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [climate-json](https://github.com/brekk/monoculture/tree/main/packages/climate-json) 🦴
    - [climate-toml](https://github.com/brekk/monoculture/tree/main/packages/climate-toml) 🦴
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/doctor-general-cli) 🦴 🧪
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [doctor-general-cli](https://github.com/brekk/monoculture/tree/main/tools/doctor-general-cli) - documentation generation in a nice CLI 🫡

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [doctor-general](https://github.com/brekk/monoculture/tree/main/packages/doctor-general) 🦴
    - [inherent](https://github.com/brekk/monoculture/tree/main/packages/inherent) 🦴
    - [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [envtrace](https://www.npmjs.com/package/envtrace) 🧪
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-environment-jsdom](https://www.npmjs.com/package/jest-environment-jsdom) 🧪
    - [madge](https://www.npmjs.com/package/madge) 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [strip-ansi](https://www.npmjs.com/package/strip-ansi) 🧪
    - [xtrace](https://www.npmjs.com/package/xtrace) 🧪

   </details>

 * [gitparty](https://github.com/brekk/monoculture/tree/main/tools/gitparty) - visualize git logs with magical context 🎨

   <details><summary>Dependencies</summary>

    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [clox](https://github.com/brekk/monoculture/tree/main/packages/clox) 🦴
    - [date-fns](https://www.npmjs.com/package/date-fns)
    - [date-fns-tz](https://www.npmjs.com/package/date-fns-tz)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [gitlog](https://www.npmjs.com/package/gitlog)
    - [micromatch](https://www.npmjs.com/package/micromatch)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [treacle](https://github.com/brekk/monoculture/tree/main/tools/treacle) 🦴
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [spacework](https://github.com/brekk/monoculture/tree/main/tools/spacework) - meta tools for monoculture ☄️

   <details><summary>Dependencies</summary>

    - [execa](https://www.npmjs.com/package/execa)
    - [fluture](https://www.npmjs.com/package/fluture)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [snang](https://www.npmjs.com/package/snang)
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪
    - [nps-utils](https://www.npmjs.com/package/nps-utils) 🧪

   </details>

 * [superorganism](https://github.com/brekk/monoculture/tree/main/tools/superorganism) - script runner from beyond the moon 🐁

   <details><summary>Dependencies</summary>

    - [chalk](https://www.npmjs.com/package/chalk)
    - [climate](https://github.com/brekk/monoculture/tree/main/packages/climate) 🦴
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)
    - [envtrace](https://www.npmjs.com/package/envtrace)
    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) 🦴
    - [project-bin-path](https://www.npmjs.com/package/project-bin-path)
    - [ramda](https://www.npmjs.com/package/ramda)
    - [esbuild](https://www.npmjs.com/package/esbuild) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [fastest-levenshtein](https://www.npmjs.com/package/fastest-levenshtein) 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

 * [treacle](https://github.com/brekk/monoculture/tree/main/tools/treacle) - command line interface tree visualization pun 🫠

   <details><summary>Dependencies</summary>

    - [file-system](https://github.com/brekk/monoculture/tree/main/packages/file-system) 🦴
    - [fluture](https://www.npmjs.com/package/fluture)
    - [gitlog](https://www.npmjs.com/package/gitlog)
    - [kiddo](https://github.com/brekk/monoculture/tree/main/packages/kiddo) 🦴
    - [ramda](https://www.npmjs.com/package/ramda)
    - [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 🧪
    - [eslint-config-monoculture](https://github.com/brekk/monoculture/tree/main/shared/eslint-config-monoculture) 🦴 🧪
    - [jest-config](https://github.com/brekk/monoculture/tree/main/shared/jest-config) 🦴 🧪
    - [nps](https://www.npmjs.com/package/nps) 🧪

   </details>

