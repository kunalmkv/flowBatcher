const { ethers } = require('ethers');

// Send ETH transaction
async function sendETH(signer, recipient, amount) {
    const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
    });
    return tx;
}

// Send ERC-20 transaction
async function sendERC20(signer, recipient, amount, tokenAddress) {
    const tokenAbi = [
        "function transfer(address recipient, uint256 amount) public returns (bool)"
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const tx = await tokenContract.transfer(recipient, ethers.parseUnits(amount, 18));
    return tx;
}

module.exports = {
    sendETH,
    sendERC20
};
