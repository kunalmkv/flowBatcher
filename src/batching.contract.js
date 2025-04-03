const ethers = require('ethers');

// Define the ABI for the batching contract
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes","name":"transactions","type":"bytes"}],"name":"multiSend","outputs":[],"stateMutability":"payable","type":"function"}]

class BatchingContract {
    constructor(provider, signer, contractAddress) {
        this.contract = new ethers.Contract(contractAddress, abi, signer);
    }

    // Method to execute batch transactions
    async executeBatchTransactions(recipients, amounts, tokenAddress) {
        // Encode recipients, amounts, and tokenAddress into bytes
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();

        // Properly encode your arguments into a bytes parameter
        const encodedData = abiCoder.encode(
            ["address[]", "uint256[]", "address"],
            [recipients, amounts, tokenAddress]
        );

        const tx = await this.contract.multiSend(encodedData, {
            value: ethers.parseEther("0")  // adjust ETH sent if needed
        });

        return tx;
    }
}

module.exports = BatchingContract;
