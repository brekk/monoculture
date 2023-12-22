const config = require('../../shared/jest-config/jest.config')
const PKG = require('./package.json')
module.exports = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: Object.values(PKG.exports),
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'lcov'],
  transform: {
    ...(config.transform || {}),
  },
}
