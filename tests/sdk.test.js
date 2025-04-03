const { expect } = require("chai")
require("dotenv").config({ path: "./.env" })
const sinon = require("sinon")

const SDK = require("../src/sdk")

const { createProviderAndSigner } = require("../src/lib/ethers.lib.src")
const generalUseUtil = require("../src/utils/general.use.utils")
const globalKeysEnum = require("../src/enums/global.keys.enum")
const loggerLib = require("../src/lib/logger.lib")

describe("SDK BatchTransfer", () => {
  let sdk
  let provider
  let signer
  let mockBatchTransferContract
  let mockERC20Contract
  let mockEstimateGasFees
  let mockPromptUser

  beforeEach(() => {
    // Create mock provider and signer
    ;({ provider, signer } = createProviderAndSigner(
      process.env.ETH_NODE_URL,
      process.env.WALLET_PRIVATE_KEY,
    ))

    // Mocking the contract methods
    mockBatchTransferContract = {
      target: "0xFakeBatchContractAddress",
      batchTransfer: sinon.stub().resolves({ hash: "0xFakeTxHash" }), // Mock batchTransfer to resolve with fake tx hash
    }

    mockERC20Contract = {
      target: "0xFakeTokenAddress",
      approve: sinon.stub().resolves({ hash: "0xFakeTxHash" }), // Mock approve to resolve with fake tx hash
      decimals: sinon.stub().resolves(18), // Mock decimals() to return 18
    }

    // Set global keys for contract addresses
    generalUseUtil.setGlobalKey(
      globalKeysEnum.BATCH_TRANSFER_CONTRACT,
      mockBatchTransferContract,
    )
    generalUseUtil.setGlobalKey(
      globalKeysEnum.ERC20_CONTRACT,
      mockERC20Contract,
    )

    // Create SDK instance
    sdk = new SDK(provider, signer, {
      batchContractAddress: "0xFakeBatchContractAddress",
      tokenAddress: "0xFakeTokenAddress",
    })
  })

  afterEach(() => {
    sinon.restore() // Restore all spies, stubs, and mocks after each test
  })

  it("should approve tokens and execute ERC-20 batch transfer correctly", async () => {
    // Prepare input data
    const recipients = ["0xRecipient1", "0xRecipient2"]
    const amounts = [100, 50]

    // Execute the ERC-20 batch transfer
    await sdk.batchTransferERC20(recipients, amounts)

    // Assertions
    expect(mockERC20Contract.approve.calledOnce).to.be.true
    expect(mockBatchTransferContract.batchTransfer.calledOnce).to.be.true
    expect(
      mockBatchTransferContract.batchTransfer.calledWith(
        recipients,
        amounts,
        "0xFakeTokenAddress",
      ),
    ).to.be.true
  })
  it("should approve tokens and execute ERC-20 batch transfer correctly", async () => {
    // Mock the approveTokens method to resolve
    const approveTokensSpy = sinon.spy(sdk, "approveTokens")

    // Prepare input data
    const recipients = ["0xRecipient1", "0xRecipient2"]
    const amounts = [100, 50]

    // Execute the ERC-20 batch transfer
    await sdk.batchTransferERC20(recipients, amounts)

    // Assertions
    expect(approveTokensSpy.calledOnce).to.be.true
    expect(mockBatchTransferContract.batchTransfer.calledOnce).to.be.true
    expect(
      mockBatchTransferContract.batchTransfer.calledWith(
        recipients,
        amounts,
        "0xFakeTokenAddress",
      ),
    ).to.be.true
    expect(
      loggerLib.logWithColor.calledWith(sinon.match.string, sinon.match.string),
    ).to.be.true
  })

  it("should throw an error for empty recipients or amounts", async () => {
    const invalidRecipients = []
    const invalidAmounts = []

    // Expect an error to be thrown when invalid inputs are provided
    await expect(
      sdk.batchTransferERC20(invalidRecipients, invalidAmounts),
    ).to.be.rejectedWith("Invalid recipients or amounts")
  })

  it("should estimate gas fees for ERC-20 batch transfer", async () => {
    const recipients = ["0xRecipient1", "0xRecipient2"]
    const amounts = [100, 50]

    // Execute the ERC-20 gas estimation
    const gasEstimate = await mockEstimateGasFees(
      recipients,
      amounts,
      "0xFakeTokenAddress",
    )

    // Assertions for gas estimation
    expect(gasEstimate.estimatedGas).to.equal("21000")
    expect(gasEstimate.gasPrice).to.equal("50")
    expect(gasEstimate.estimatedCostInEth).to.equal("0.001")
    expect(gasEstimate.estimatedCostInUsd).to.equal("2.50")
  })

  it("should prompt the user and handle user confirmation correctly", async () => {
    const confirmSpy = sinon.spy(mockPromptUser)
    const recipients = ["0xRecipient1", "0xRecipient2"]
    const amounts = [100, 50]

    // Mock user confirmation
    mockPromptUser.resolves("yes")

    // Execute the ERC-20 batch transfer
    await sdk.batchTransferERC20(recipients, amounts)

    // Ensure promptUser was called
    expect(confirmSpy.calledOnce).to.be.true
    expect(
      confirmSpy.calledWith("Proceed with ERC-20 Batch Transfer? (yes/no): "),
    ).to.be.true
  })

  it("should throw error when gas estimation fails", async () => {
    // Simulate gas estimation failure
    mockEstimateGasFees.rejects(new Error("Gas estimation failed"))

    // Prepare input data
    const recipients = ["0xRecipient1", "0xRecipient2"]
    const amounts = [100, 50]

    // Expect the function to throw an error
    await expect(
      sdk.batchTransferERC20(recipients, amounts),
    ).to.be.rejectedWith("Gas estimation failed")
  })
})
