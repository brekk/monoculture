import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const projectWebsiteLink = 'https://brekk.github.io/monoculture'
const projectRepoLink = 'https://github.com/brekk/monoculture'

const config: DocsThemeConfig = {
  logo: <span>Monoculture</span>,
  project: {
    link: projectRepoLink,
  },
  docsRepositoryBase: `${projectRepoLink}/tree/main`,
  footer: {
    text: 'Tools for Monorepos',
  },
  darkMode: false,
  nextThemes: {
    defaultTheme: 'dark',
    storageKey: 'monoculture-docs-theme',
  },
}

export default config
