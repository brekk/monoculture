/** @type {import('next').NextConfig} */
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra({
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '/ui/ui-factory/docs',
  transpilePackages: ['ui-scaffold', 'data-hooks'],
})
