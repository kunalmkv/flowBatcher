const { ethers } = require('ethers');
const BatchingContract = require('./batching.contract');

class SDK {
    constructor(provider, signer, config = {}) {
        this.provider = provider;
        this.signer = signer;
        this.config = config || {};
        this.batchContract = new BatchingContract(provider, signer, "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761");
    }

    // Send native ETH
    async sendETH(recipient, amount) {
        const tx = await this.signer.sendTransaction({
            to: recipient,
            value: ethers.parseEther(amount)
        });
        return tx;
    }

    // Send ERC-20 tokens
    async sendERC20(recipient, amount, tokenAddress) {
        const tokenAbi = require('./abis/erc20.token.abi.json');
        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
        const tx = await tokenContract.transfer(recipient, ethers.parseUnits(amount, 18));
        return tx;
    }

    // Execute a batch of transactions (ETH or ERC-20)
    async executeBatch(recipients, amounts, tokenAddress = null) {
        if (tokenAddress) {
            // Send ERC-20 transactions in batch
            return this.batchContract.executeBatchTransactions(recipients, amounts, tokenAddress);
        } else {
            // Send ETH transactions in batch
            for (let i = 0; i < recipients.length; i++) {
                await this.sendETH(recipients[i], amounts[i]);
            }
            return Promise.resolve({});  // Empty transaction object for ETH
        }
    }

    // Estimate gas for ETH transaction
    async estimateETHGas(recipient, amount) {
        const tx = {
            to: recipient,
            value: ethers.parseEther(amount)
        };
        const gasEstimate = await this.signer.estimateGas(tx);
        return gasEstimate;
    }

    // Estimate gas for ERC-20 transaction
    async estimateERC20Gas(tokenAddress, recipient, amount) {
        const tokenAbi = [
            "function transfer(address recipient, uint256 amount) public returns (bool)"
        ];
        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
        const gasEstimate = await tokenContract.estimateGas.transfer(recipient, ethers.parseUnits(amount, 18));
        return gasEstimate;
    }

    // Get the current gas price
    async estimateGasPrice() {
        const gasPrice = await this.provider.getGasPrice();
        return gasPrice;
    }
}

module.exports = SDK;
