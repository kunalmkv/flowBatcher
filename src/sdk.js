const {ethers} = require("ethers");

const ethersLib= require("./lib/ethers.lib.src.js");

const erc20ContractABI = require("./abis/erc20.token.abi.json");
const batchTransferContractABI = require("./abis/batch.transfer.abi.json");

const { estimateGasFees } = require("./gas.estimator");

const { promptUser } = require("./utils/transaction.utils");
const generalUseUtil= require("./utils/general.use.util");

const globalKeysEnum= require("./enums/global.keys.enum");

class SDK {
    constructor(provider, signer, config = {}) {
        generalUseUtil.setGlobalKey((globalKeysEnum.PROVIDER), provider);
        generalUseUtil.setGlobalKey(globalKeysEnum.SIGNER, signer);
        generalUseUtil.setGlobalKey(globalKeysEnum.BATCH_TRANSFER_CONTRACT, ethersLib.createContract(signer,config.batchContractAddress,batchTransferContractABI));
        generalUseUtil.setGlobalKey(globalKeysEnum.ERC20_CONTRACT, ethersLib.createContract(signer,config.tokenAddress,erc20ContractABI));
    }

    async batchTransferERC20(recipients, amounts) {
        const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
        const batchContract = generalUseUtil.getGlobalKey(globalKeysEnum.BATCH_TRANSFER_CONTRACT);
        const erc20Contract = generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT);

        // Approve tokens first
        await ethersLib.approveTokens(batchContract.target, totalAmount);

        // Estimate gas fees
        const gasEstimate = await estimateGasFees(recipients, amounts,generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT).target);
        console.log("\n🚨 GAS FEE ESTIMATE FOR ERC-20 BATCH TRANSFER:");
        console.log(`- Estimated Gas: ${gasEstimate.estimatedGas}`);
        console.log(`- Gas Price (gwei): ${gasEstimate.gasPrice}`);
        console.log(`- Estimated Cost (ETH): ${gasEstimate.estimatedCost}\n`);

        // Confirm from user
        const confirm = await promptUser("Proceed with ERC-20 Batch Transfer? (yes/no): ");
        if (confirm.toLowerCase() !== "yes") {
            console.log("🚫 Transaction cancelled by user.");
            return;
        }
        console.log(erc20Contract.target, "erc20Contract.addressq2323")
        console.log(erc20Contract, "erc20Contract.addresserc20Contract.addresserc20Contract.address")
        const tx = await ethersLib.executeBatchTransactions(recipients, amounts, erc20Contract.target);
        console.log("Batch ERC-20 Transfer tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ ERC-20 Batch Transfer completed!");
    }

    async batchTransferNative(recipients, amounts) {
        const gasEstimate = await estimateGasFees( recipients, amounts, ethers.ZeroAddress, true);

        console.log("\n🚨 GAS FEE ESTIMATE FOR NATIVE ETH BATCH TRANSFER:");
        console.log(`- Estimated Gas: ${gasEstimate.estimatedGas}`);
        console.log(`- Gas Price (gwei): ${gasEstimate.gasPrice}`);
        console.log(`- Estimated Cost (ETH): ${gasEstimate.estimatedCost}\n`);

        const confirm = await promptUser("Proceed with Native ETH Batch Transfer? (yes/no): ");
        if (confirm.toLowerCase() !== "yes") {
            console.log("🚫 Transaction cancelled by user.");
            return;
        }
       const batchContract = generalUseUtil.getGlobalKey("batchContract");
        const tx = await ethersLib.executeBatchTransactions(recipients, amounts, ethers.ZeroAddress, true);
        console.log("Batch Native ETH Transfer tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ Native ETH Batch Transfer completed!");
    }
}

module.exports = SDK;
