/**
 * @module ethersLib
 * @dev:kunalmkv
 *
 * This module provides utility functions for interacting with the Ethereum blockchain using the ethers.js library.
 * This module helps streamline the process of sending batch transactions, ensuring that multiple transfers are executed in a single batch, which reduces gas fees and transaction complexity.
 */

const { ethers } = require("ethers")
const generalUseUtil = require("../utils/general.use.utils")
const validatorUtil = require("../utils/validators.utils")
const errorUtil = require("../utils/error.utils")
const globalKeysEnum = require("../enumS/global.keys.enum")
const loggerLib = require("./logger.lib")
const loggerColourEnum = require("../enums/logger.colours.enum")

/**
 * Creates an Ethereum provider and signer using the provided RPC URL and private key.
 * If either the RPC URL or the private key is empty, it throws an error and logs it.
 *
 * @param {string} rpcUrl - The URL of the Ethereum RPC provider (e.g., Infura, Alchemy).
 * @param {string} privateKey - The private key of the Ethereum wallet (64-character hex string starting with `0x`).
 *
 * @throws {Error} - Throws an error if either the RPC URL or private key is empty.
 *
 * @returns {Object} - An object containing the **provider** and **signer**.
 * @returns {ethers.JsonRpcProvider} provider - The provider to interact with the Ethereum network.
 * @returns {ethers.Wallet} signer - The signer to sign and send transactions.
 */
function createProviderAndSigner(rpcUrl, privateKey) {
  try {
    if (validatorUtil.isEmpty(rpcUrl) || validatorUtil.isEmpty(privateKey)) {
      loggerLib.logWithColor(
        "RPC URL or Private Key is empty!",
        loggerColourEnum.ERR,
      )
      errorUtil.throwError(
        `RPC URL: ${rpcUrl} or Private Key : ${privateKey} is empty!`,
      )
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(privateKey, provider)
    return { provider, signer }
  } catch (e) {
    throw e
  }
}

/**
 * Creates an instance of an Ethereum contract using the provided signer, contract address, and ABI.
 * If the signer, contract address, or ABI is empty, it throws an error and logs it.
 *
 * @param {ethers.Wallet} signer - The signer object used to interact with the contract.
 * @param {string} contractAddress - The address of the Ethereum contract to interact with.
 * @param {Array} abi - The ABI (Application Binary Interface) of the contract, which defines the functions and events.
 *
 * @throws {Error} - Throws an error if the signer, contract address, or ABI is empty.
 *
 * @returns {ethers.Contract} - The contract instance for interacting with the Ethereum contract.
 */
function createContract(signer, contractAddress, abi) {
  try {
    if (
      validatorUtil.isEmpty(signer) ||
      validatorUtil.isEmpty(contractAddress) ||
      validatorUtil.isEmpty(abi)
    ) {
      loggerLib.logWithColor(
        "Signer, Contract Address or ABI is empty!",
        loggerColourEnum.ERR,
      )
      errorUtil.throwError(
        `Signer: ${signer} , Contract Address : ${contractAddress} or ABI : ${abi} is empty!`,
      )
    }
    return new ethers.Contract(contractAddress, abi, signer)
  } catch (e) {
    throw e
  }
}

/**
 * Approves the transfer of ERC-20 tokens from the sender's wallet to a specified spender address.
 * This is necessary for executing batch transfers of ERC-20 tokens.
 *
 * @async
 * @param {string} spender - The address allowed to spend the tokens.
 * @param {number} amount - The amount of tokens to approve for transfer.
 *
 * @throws {Error} Throws an error if either spender or amount is empty.
 *
 * @returns {Promise} - A promise that resolves when the transaction is mined, returning the transaction details.
 */
async function approveTokens(spender, amount) {
  try {
    if (validatorUtil.isEmpty(spender) || validatorUtil.isEmpty(amount)) {
      loggerLib.logWithColor(
        "Spender or Amount is empty!",
        loggerColourEnum.ERR,
      )
      errorUtil.throwError(
        `Spender: ${spender} or Amount : ${amount} is empty!`,
      )
    }
    const erc20Contract = generalUseUtil.getGlobalKey(
      globalKeysEnum.ERC20_CONTRACT,
    )
    const decimals = await erc20Contract.decimals() // Get token decimals
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals) // Convert the amount to the correct units
    const transaction = await erc20Contract.approve(spender, parsedAmount) // Call the approve function on the contract
    await transaction.wait() // Wait for the transaction to be mined
    loggerLib.logWithColor(
      "Tokens approved successfully!",
      loggerColourEnum.INFO,
    )
    return transaction
  } catch (e) {
    throw e
  }
}

/**
 * Executes a batch transfer of either ERC-20 tokens or native Ethereum (ETH) to multiple recipients.
 *
 * @async
 * @param {string[]} recipients - An array of recipient addresses.
 * @param {number[]} amounts - An array of amounts to transfer to each recipient.
 * @param {string} tokenAddress - The ERC-20 token address (use `ethers.ZeroAddress` for ETH).
 * @param {boolean} [isNative=false] - A flag indicating whether the transfer is native ETH (default is false for ERC-20 tokens).
 *
 * @throws {Error} Throws an error if either recipients or amounts arrays are empty.
 *
 * @returns {Promise} - A promise that resolves when the batch transfer is completed, returning the transaction details.
 */
async function executeBatchTransactions(
  recipients,
  amounts,
  tokenAddress,
  isNative = false,
) {
  try {
    if (validatorUtil.isEmpty(recipients) || validatorUtil.isEmpty(amounts)) {
      loggerLib.logWithColor(
        "Recipients or Amounts is empty!",
        loggerColourEnum.ERR,
      )
      errorUtil.throwError(
        `Recipients: ${recipients} or Amounts : ${amounts} is empty!`,
      )
    }
    let transaction
    const batchTransferContract = generalUseUtil.getGlobalKey(
      globalKeysEnum.BATCH_TRANSFER_CONTRACT,
    )

    if (validatorUtil.isEmpty(isNative)) {
      const erc20Contract = generalUseUtil.getGlobalKey(
        globalKeysEnum.ERC20_CONTRACT,
      )
      const decimals = await erc20Contract.decimals()
      const parsedAmounts = amounts.map((a) =>
        ethers.parseUnits(a.toString(), decimals),
      )

      const transaction = await batchTransferContract.batchTransfer(
        recipients,
        parsedAmounts,
        tokenAddress,
      )
      loggerLib.logWithColor(
        `Batch ERC-20 Transfer transaction hash: ${transaction.hash}`,
        loggerColourEnum.INFO,
      )
      await transaction.wait()
      loggerLib.logWithColor(
        "✅ ERC-20 Batch Transfer completed!",
        loggerColourEnum.INFO,
      )
    } else {
      const parsedAmounts = amounts.map((a) => ethers.parseEther(a.toString()))
      const totalAmount = parsedAmounts.reduce(
        (sum, val) => sum + val,
        ethers.parseEther("0"),
      )
      transaction = await batchTransferContract.batchTransfer(
        recipients,
        parsedAmounts,
        ethers.ZeroAddress,
        { value: totalAmount },
      )
      loggerLib.logWithColor(
        `Batch Native Transfer transaction hash: ${transaction.hash}`,
        loggerColourEnum.INFO,
      )
      await transaction.wait()
      loggerLib.logWithColor(
        "✅ Native Batch Transfer completed!",
        loggerColourEnum.INFO,
      )
    }
    return transaction
  } catch (e) {
    throw e
  }
}
module.exports = {
  createProviderAndSigner: createProviderAndSigner,
  createContract: createContract,
  approveTokens: approveTokens,
  executeBatchTransactions: executeBatchTransactions,
}
