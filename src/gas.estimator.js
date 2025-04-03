const { ethers } = require("ethers")
const { getEthPriceInUsd } = require("./lib/price.lib")
const generalUseUtil = require("./utils/general.use.utils")
const validatorsUtil = require("./utils/validators.utils")
const errorUtil = require("./utils/error.utils")
const globalKeysEnum = require("./enums/global.keys.enum")

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
