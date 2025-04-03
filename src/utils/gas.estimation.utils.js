const { ethers } = require("ethers")

// Estimate gas for ETH transaction
async function estimateETHGas(provider, recipient, amount) {
  const tx = {
    to: recipient,
    value: ethers.parseEther(amount),
  }
  const gasEstimate = await provider.estimateGas(tx)
  return gasEstimate
}

// Estimate gas for ERC-20 transaction
async function estimateERC20Gas(provider, tokenAddress, recipient, amount) {
  const tokenAbi = [
    "function transfer(address recipient, uint256 amount) public returns (bool)",
  ]
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider)
  const gasEstimate = await tokenContract.estimateGas.transfer(
    recipient,
    ethers.parseUnits(amount, 18),
  )
  return gasEstimate
}

module.exports = {
  estimateETHGas,
  estimateERC20Gas,
}
