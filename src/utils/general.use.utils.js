const validatorsUtil = require("./validators.utils")
const errorUtil = require("./error.utils")
function setGlobalKey(key, value) {
  try {
    global[key] = value
  } catch (error) {
    throw error
  }
}

/**
 * @param {string} key
 */
function getGlobalKey(key) {
  try {
    if (validatorsUtil.isEmpty(key)) {
      errorUtil.throwError(`Invalid key: ${key}`)
    }
    return global[key]
  } catch (error) {
    throw error
  }
}

module.exports = {
  setGlobalKey: setGlobalKey,
  getGlobalKey: getGlobalKey,
}
