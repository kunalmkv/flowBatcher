/*
description : this file is used for logging in the terminal
*/
const chalk = require("chalk")

const dateUtil = require("../utils/date.utils")
const errorUtil = require("../utils/error.utils")
const validatorUtil = require("../utils/validators.utils")
const logTypeEnum = require("../enums/log.type.enum")

//used to log with general color ( green )
/**
 * @param {string} message
 */
function log(message) {
  if (validatorUtil.isEmpty(message)) {
    errorUtil.throwError(`Message is empty! message: ${message}`)
  }
  logWithColor(message, logTypeEnum.INFO)
}

//used to log with color ( error => red ,  warn => yellow , info => green , debug => white )

/**
 * @param {string} message
 * @param {string} type
 * @param {object} data
 */
function logWithColor(message, type, data = {}) {
  //check if message or type is empty
  if (validatorUtil.isEmpty(message) || validatorUtil.isEmpty(type)) {
    errorUtil.throwError(
      `Message or type is empty! message: ${message} , type: ${type}`,
    )
  }

  const logData = {
    date: dateUtil.getCurrentIndianTime(),
    message: message,
    data: data,
  }

  // eslint-disable-next-line no-console
  console.log(chalk[type](logData))
}

module.exports = {
  log: log,
  logWithColor: logWithColor,
}
