const { ethers } = require("ethers")

const ethersLib = require("./lib/ethers.lib.src.js")
const loggerLib = require("./lib/logger.lib")

const erc20ContractABI = require("./abis/erc20.token.abi.json")
const batchTransferContractABI = require("./abis/batch.transfer.abi.json")

const { estimateGasFees } = require("./gas.estimator")

const { promptUser } = require("./utils/transaction.utils")
const generalUseUtil = require("./utils/general.use.utils")

const globalKeysEnum = require("./enums/global.keys.enum")
const loggerColourEnum = require("./enums/logger.colours.enum")
const validatorsUtil = require("./utils/validators.utils")
const errorUtil = require("./utils/error.utils")

class SDK {
  constructor(provider, signer, config = {}) {
    generalUseUtil.setGlobalKey(globalKeysEnum.PROVIDER, provider)
    generalUseUtil.setGlobalKey(globalKeysEnum.SIGNER, signer)
    generalUseUtil.setGlobalKey(
      globalKeysEnum.BATCH_TRANSFER_CONTRACT,
      ethersLib.createContract(
        signer,
        config.batchContractAddress,
        batchTransferContractABI,
      ),
    )
    generalUseUtil.setGlobalKey(
      globalKeysEnum.ERC20_CONTRACT,
      ethersLib.createContract(signer, config.tokenAddress, erc20ContractABI),
    )
  }

  async batchTransferERC20(recipients, amounts) {
    if (validatorsUtil.isEmpty(recipients) || validatorsUtil.isEmpty(amounts)) {
      errorUtil.throwError(
        `Invalid recipients or amounts: ${recipients}, ${amounts}`,
      )
    }
    const totalAmount = amounts.reduce((sum, val) => sum + val, 0)
    const batchContract = generalUseUtil.getGlobalKey(
      globalKeysEnum.BATCH_TRANSFER_CONTRACT,
    )
    const erc20Contract = generalUseUtil.getGlobalKey(
      globalKeysEnum.ERC20_CONTRACT,
    )

    // Approve tokens first
    await ethersLib.approveTokens(batchContract.target, totalAmount)

    // Estimate gas fees
    const gasEstimate = await estimateGasFees(
      recipients,
      amounts,
      generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT).target,
    )

    loggerLib.logWithColor(
      `🚨 GAS FEE ESTIMATE FOR ERC-20 BATCH TRANSFER: 
         - Estimated Gas: ${gasEstimate.estimatedGas}  
         - Gas Price (gwei): ${gasEstimate.gasPrice}
          - Estimated Cost (ETH): ${gasEstimate.estimatedCostInEth}
           - Estimated Cost (USD): ${gasEstimate.estimatedCostInUsd}`,
      loggerColourEnum.WARN,
    )

    // Confirm from user
    const confirm = await promptUser(
      "Proceed with ERC-20 Batch Transfer? (yes/no): ",
    )
    if (confirm.toLowerCase() !== "yes") {
      loggerLib.logWithColor(
        "🚫 Transaction cancelled by user.",
        loggerColourEnum.ERR,
      )
      return
    }
    const tx = await ethersLib.executeBatchTransactions(
      recipients,
      amounts,
      erc20Contract.target,
    )
    loggerLib.logWithColor(
      "Batch ERC-20 Transfer tx hash:",
      tx,
      loggerColourEnum.INFO,
    )
    await tx.wait()
    loggerLib.logWithColor(
      "✅ ERC-20 Batch Transfer completed!",
      loggerColourEnum.INFO,
    )
  }

  async batchTransferNative(recipients, amounts) {
    const gasEstimate = await estimateGasFees(
      recipients,
      amounts,
      ethers.ZeroAddress,
      true,
    )

    loggerLib.logWithColor(
      `🚨 GAS FEE ESTIMATE FOR NATIVE ETH BATCH TRANSFER :
            - Estimated Gas: ${gasEstimate.estimatedGas}  
            - Gas Price (gwei): ${gasEstimate.gasPrice}
            - Estimated Cost (ETH): ${gasEstimate.estimatedCostInEth}
            - Estimated Cost (USD): ${gasEstimate.estimatedCostInUsd}`,
      loggerColourEnum.WARN,
    )

    const confirm = await promptUser(
      "Proceed with Native ETH Batch Transfer? (yes/no): ",
    )
    if (confirm.toLowerCase() !== "yes") {
      loggerLib.logWithColor(
        "🚫 Transaction cancelled by user.",
        loggerColourEnum.ERR,
      )
      return
    }

    const tx = await ethersLib.executeBatchTransactions(
      recipients,
      amounts,
      ethers.ZeroAddress,
      true,
    )
    loggerLib.logWithColor(
      `Batch Native ETH Transfer tx hash:${tx.hash}`,
      loggerColourEnum.INFO,
    )
    await tx.wait()
    loggerLib.logWithColor(
      "✅ Native ETH Batch Transfer completed!",
      loggerColourEnum.INFO,
    )
  }
}

module.exports = SDK
