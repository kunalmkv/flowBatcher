/*
description : this file is used for logging in the terminal
*/
const chalk = require("chalk")

const dateUtil = require("../utils/date.utils")
const errorUtil = require("../utils/error.utils")
const validatorUtil = require("../utils/validators.utils")
const logTypeEnum = require("../enums/log.type.enum")

/**
 * Logs a message with the default color (green) to the console.
 * If the message is empty, it throws an error.
 *
 * @param {string} message - The message to log to the console.
 *
 * @throws {Error} Throws an error if the message is empty.
 *
 * @returns {void} This function doesn't return anything. It logs the message to the console.
 */
function log(message) {
  try{
    if (validatorUtil.isEmpty(message)) {
      errorUtil.throwError(`Message is empty! message: ${message}`)
    }
    logWithColor(message, logTypeEnum.INFO)
  }catch (e) {

  }
}

/**
 * Logs a message to the console with a specified color and optional additional data.
 * Supports different log types (error, warn, info, debug).
 *
 * @param {string} message - The message to log to the console.
 * @param {string} type - The log type that determines the color. It can be one of the following:
 *   - 'error' -> Red
 *   - 'warn' -> Yellow
 *   - 'info' -> Green
 *   - 'debug' -> White
 * @param {object} [data={}] - Optional additional data to include in the log. Default is an empty object.
 *
 * @throws {Error} Throws an error if either the message or type is empty.
 *
 * @returns {void} This function doesn't return anything. It logs the message to the console with the specified color.
 */
function logWithColor(message, type, data = {}) {
  try{
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
  }catch (e) {
    throw e
  }
}

module.exports = {
  log: log,
  logWithColor: logWithColor,
}
