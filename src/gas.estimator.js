const { ethers } = require("ethers")
const { getEthPriceInUsd } = require("./lib/price.lib")
const generalUseUtil = require("./utils/general.use.utils")
const validatorsUtil = require("./utils/validators.utils")
const errorUtil = require("./utils/error.utils")
const globalKeysEnum = require("./enums/global.keys.enum")

/**
 * Estimates the gas fees for executing a batch transfer of ERC-20 tokens or native Ethereum (ETH).
 * This function calculates the estimated gas based on the number of recipients, the amounts to be transferred, and whether the transfer is for native ETH or ERC-20 tokens.
 *
 * @async
 * @param {string[]} recipients - An array of recipient addresses for the batch transfer.
 * @param {number[]} amounts - An array of amounts to transfer to each recipient.
 * @param {string} tokenAddress - The ERC-20 token address. Use `ethers.ZeroAddress` for native ETH transfers.
 * @param {boolean} [isNative=false] - A flag indicating whether the transfer is native Ethereum (ETH) (default is false for ERC-20 tokens).
 *
 * @throws {Error} - Throws an error if the recipients or amounts are empty, or if there is an issue estimating gas fees.
 *
 * @returns {Promise<Object>} - A promise that resolves with an object containing:
 * - `estimatedGas`: The estimated gas for the batch transfer (in units).
 * - `gasPrice`: The current gas price in **gwei**.
 * - `estimatedCostInEth`: The estimated cost in **ETH**.
 * - `estimatedCostInUsd`: The estimated cost in **USD** (using the current ETH to USD exchange rate).
 */
async function estimateGasFees(
  recipients,
  amounts,
  tokenAddress,
  isNative = false,
) {
  try {
    if (validatorsUtil.isEmpty(recipients) || validatorsUtil.isEmpty(amounts)) {
      errorUtil.throwError(
        `Invalid recipients or amounts: ${recipients}, ${amounts}`,
      )
    }

    const tokenContract = generalUseUtil.getGlobalKey(
      globalKeysEnum.ERC20_CONTRACT,
    )
    const decimals = isNative ? 18 : await tokenContract.decimals()
    const parsedAmounts = amounts.map((a) =>
      ethers.parseUnits(a.toString(), decimals),
    )
    const totalAmount = parsedAmounts.reduce(
      (a, b) => a + b,
      ethers.parseUnits("0", decimals),
    )

    const batchTransferContract = generalUseUtil.getGlobalKey(
      globalKeysEnum.BATCH_TRANSFER_CONTRACT,
    )
    const provider = generalUseUtil.getGlobalKey(globalKeysEnum.PROVIDER)
    const signer = generalUseUtil.getGlobalKey(globalKeysEnum.SIGNER)
    const txData =
      await batchTransferContract.batchTransfer.populateTransaction(
        recipients,
        parsedAmounts,
        tokenAddress,
        isNative ? { value: totalAmount } : {},
      )

    const estimatedGas = await provider.estimateGas({
      ...txData,
      from: signer.address,
      value: isNative ? totalAmount : 0,
    })
    const gasPrice = await provider.getFeeData()

    const estimatedCost = estimatedGas * gasPrice.gasPrice
    const ethToUsd = await getEthPriceInUsd()
    const estimatedgasInEth = parseFloat(ethers.formatEther(estimatedCost))
    const estimatedCostInUsd = estimatedgasInEth * ethToUsd

    return {
      estimatedGas: estimatedGas.toString(),
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, "gwei"),
      estimatedCostInEth: estimatedgasInEth,
      estimatedCostInUsd: estimatedCostInUsd,
    }
  } catch {
    throw new Error("Error estimating gas fees")
  }
}
module.exports = { estimateGasFees: estimateGasFees }
