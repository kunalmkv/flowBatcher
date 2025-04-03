/** @param {string} message
 * @param {object} jsonData
 */
function throwError(message, jsonData = {}) {
  const err = new Error(message)
  err.data = JSON.stringify(jsonData)
  throw err
}

module.exports = {
  throwError: throwError,
}
