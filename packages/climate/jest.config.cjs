const config = require('../../shared/jest-config/jest.config')
const PKG = require('./package.json')
module.exports = {
  ...config,
  collectCoverageFrom: Object.values(PKG.exports),
  transform: {
    ...(config.transform || {}),
  },
}
