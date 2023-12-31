const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverageFrom: [
    './**',
    '!./**/dist/**',
    '!./__snapshots__/**',
    '!./**/coverage/**',
    '!./executable.js',
    '!./digested.js',
  ],
}
