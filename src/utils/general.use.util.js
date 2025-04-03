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
        return global[key]
    } catch (error) {
        throw error
    }
}

module.exports = {
    setGlobalKey:setGlobalKey,
    getGlobalKey:getGlobalKey
}