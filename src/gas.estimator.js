const { ethers } = require("ethers");
const generalUseUtil= require("./utils/general.use.util")
const globalKeysEnum= require("./enums/global.keys.enum")

async function estimateGasFees(recipients, amounts, tokenAddress, isNative = false) {
    const tokenContract = generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT);
    const decimals = isNative ? 18 : await tokenContract.decimals();
    const parsedAmounts = amounts.map(a => ethers.parseUnits(a.toString(), decimals));
    const totalAmount = parsedAmounts.reduce((a, b) => a + b, ethers.parseUnits("0", decimals));

    const batchTransferContract= generalUseUtil.getGlobalKey(globalKeysEnum.BATCH_TRANSFER_CONTRACT);
    const provider= generalUseUtil.getGlobalKey(globalKeysEnum.PROVIDER);
    const signer= generalUseUtil.getGlobalKey(globalKeysEnum.SIGNER);
    console.log(recipients,"recipients inside estimator")
    console.log(parsedAmounts, "parsedAmounts  inside estimato")
    console.log(tokenAddress, "tokenAddress  inside estimato")
    const txData = await batchTransferContract.batchTransfer.populateTransaction(
        recipients, parsedAmounts, tokenAddress,
        isNative ? { value: totalAmount } : {}
    );

    const estimatedGas = await provider.estimateGas({
        ...txData,
        from: signer.address,
        value: isNative ? totalAmount : 0
    });
    console.log("provider Estimated Gas:", provider);
    const gasPrice = await provider.getFeeData();

    const estimatedCost = estimatedGas * gasPrice.gasPrice;

    return {
        estimatedGas: estimatedGas.toString(),
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, "gwei"),
        estimatedCost: ethers.formatEther(estimatedCost)
    };
}
module.exports = { estimateGasFees:estimateGasFees };
