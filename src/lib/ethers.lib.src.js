const { ethers } = require("ethers");
const generalUseUtil = require("../utils/general.use.util");
const globalKeysEnum = require("../enumS/global.keys.enum");

// Function to create a provider and signer
function createProviderAndSigner(rpcUrl, privateKey) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    console.log(provider, "provider inside lib");
    console.log(signer, "signer inside lib");
    return { provider, signer };
}

// Function to create a contract instance
function createContract( signer, contractAddress, abi) {
    return new ethers.Contract(contractAddress, abi, signer)
}
async function approveTokens(spender, amount) {
    const erc20Contract = generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT)
    const decimals = await erc20Contract.decimals(); // Get token decimals
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals); // Convert the amount to the correct units
    const tx = await erc20Contract.approve(spender, parsedAmount); // Call the approve function on the contract
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Tokens approved successfully!");
    return tx;
}
async function  executeBatchTransactions(recipients, amounts, tokenAddress, isNative = false) {
    let tx;
   const batchTransferContract = generalUseUtil.getGlobalKey(globalKeysEnum.BATCH_TRANSFER_CONTRACT);

    if(!isNative) {
        const erc20Contract = generalUseUtil.getGlobalKey(globalKeysEnum.ERC20_CONTRACT)
        const decimals = await erc20Contract.decimals();
        const parsedAmounts = amounts.map(a => ethers.parseUnits(a.toString(), decimals));

        const tx = await batchTransferContract.batchTransfer(recipients, parsedAmounts, tokenAddress);
        console.log("Batch ERC-20 Transfer tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ ERC-20 Batch Transfer completed!");
    }
    else{
        const parsedAmounts = amounts.map(a => ethers.parseEther(a.toString()));
        const totalAmount = parsedAmounts.reduce((sum, val) => sum + val, ethers.parseEther("0"));
         tx = await batchTransferContract.batchTransfer(
            recipients, parsedAmounts, ethers.ZeroAddress, { value: totalAmount }
        );
        console.log("Batch Native Transfer tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ Native Batch Transfer completed!");
    }
    return tx;
}
module.exports = {
    createProviderAndSigner:createProviderAndSigner,
    createContract:createContract,
    approveTokens:approveTokens,
    executeBatchTransactions:executeBatchTransactions
};
