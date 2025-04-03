/*
  description: contains different types of log types
    usage :  (used in logger lib to give the type)
 */

const logEnum = Object.freeze({
  INFO: "INFO",
  ERR: "ERR",
  WARN: "WARN",
  DEBUG: "DEBUG",
  WTF: "WTF",
})

module.exports = logEnum
