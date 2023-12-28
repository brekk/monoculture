const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: ['!dist/**', '!fixture/**', './*'],
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'lcov'],
  transform: {
    ...(config.transform || {}),
  },
}
