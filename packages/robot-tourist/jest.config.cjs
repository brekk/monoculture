const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: ['src/*.js'],
  coveragePathIgnorePatterns: [
    'src/index.js',
    'src/cli.js',
    'src/plugin-simple.js',
    'src/plugin-robot-tourist.js',
  ],
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'lcov'],
  transform: {
    ...config.transform,
  },
}
