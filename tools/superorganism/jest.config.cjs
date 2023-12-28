const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverageFrom: ['src/*.js', '!src/index.js'],
}
