const { expect } = require('chai');
const sinon = require('sinon');
const loggerLib = require('../src/lib/logger.lib');
const chalk = require('chalk');
const errorUtil = require('../src/utils/error.utils');
const validatorUtil = require('../src/utils/validators.utils');
const logTypeEnum = require('../src/enums/log.type.enum');

describe('Logger Library', () => {
    let logWithColorSpy;
    let throwErrorSpy;

    beforeEach(() => {
        // Spy on logWithColor and throwError
        logWithColorSpy = sinon.spy(loggerLib, 'logWithColor');
        throwErrorSpy = sinon.spy(errorUtil, 'throwError');
    });

    afterEach(() => {
        // Restore all spies after each test
        sinon.restore();
    });

    it('should log message with default color (green)', () => {
        const message = "This is an info log";
        const expectedLogData = {
            date: sinon.match.string, // Date should be a string
            message: message,
            data: {},
        };

        // Call the log function
        loggerLib.log(message);

        // Assert logWithColor was called with the correct parameters
        expect(logWithColorSpy.calledOnce).to.be.true;
        expect(logWithColorSpy.firstCall.args[0]).to.equal(message);
        expect(logWithColorSpy.firstCall.args[1]).to.equal(logTypeEnum.INFO);
        expect(logWithColorSpy.firstCall.args[2]).to.deep.equal({});
    });

    it('should log message with custom color (red)', () => {
        const message = "This is an error log";
        const expectedLogData = {
            date: sinon.match.string, // Date should be a string
            message: message,
            data: {},
        };

        // Call the logWithColor function directly
        loggerLib.logWithColor(message, logTypeEnum.ERR);

        // Assert logWithColor was called with the correct parameters
        expect(logWithColorSpy.calledOnce).to.be.true;
        expect(logWithColorSpy.firstCall.args[0]).to.equal(message);
        expect(logWithColorSpy.firstCall.args[1]).to.equal(logTypeEnum.ERR);
        expect(logWithColorSpy.firstCall.args[2]).to.deep.equal({});
    });

    it('should throw error if message is empty in log function', () => {
        const emptyMessage = "";

        // Call log with an empty message
        loggerLib.log(emptyMessage);

        // Assert that throwError was called
        expect(throwErrorSpy.calledOnce).to.be.true;
        expect(throwErrorSpy.firstCall.args[0]).to.equal('Message is empty! message: ');
    });

    it('should throw error if message or type is empty in logWithColor function', () => {
        const emptyMessage = "";
        const validType = logTypeEnum.INFO;

        // Call logWithColor with an empty message
        loggerLib.logWithColor(emptyMessage, validType);

        // Assert that throwError was called
        expect(throwErrorSpy.calledOnce).to.be.true;
        expect(throwErrorSpy.firstCall.args[0]).to.equal(
            'Message or type is empty! message: , type: info'
        );
    });

    it('should throw error if type is empty in logWithColor function', () => {
        const message = "This is a log with no type";
        const emptyType = "";

        // Call logWithColor with an empty type
        loggerLib.logWithColor(message, emptyType);

        // Assert that throwError was called
        expect(throwErrorSpy.calledOnce).to.be.true;
        expect(throwErrorSpy.firstCall.args[0]).to.equal(
            'Message or type is empty! message: This is a log with no type , type: '
        );
    });
});

// ethers lib

describe('Ethers Library - approveTokens and executeBatchTransactions', () => {
    let logWithColorSpy;
    let mockERC20Contract;
    let mockBatchTransferContract;
    let mockProvider;
    let mockSigner;

    beforeEach(() => {
        // Spy on logWithColor
        logWithColorSpy = sinon.spy(loggerLib, 'logWithColor');

        // Mock ERC-20 contract
        mockERC20Contract = {
            decimals: sinon.stub().resolves(18),
            approve: sinon.stub().resolves({ hash: '0xFakeTxHash' }),
        };

        // Mock batch transfer contract
        mockBatchTransferContract = {
            batchTransfer: sinon.stub().resolves({ hash: '0xFakeBatchTxHash' }),
        };

        // Mock provider and signer
        mockProvider = new ethers.JsonRpcProvider('https://fake-rpc-url.com');
        mockSigner = new ethers.Wallet('0xfakeprivatekey', mockProvider);

        // Set global keys for ERC-20 contract and batch transfer contract
        generalUseUtil.setGlobalKey(globalKeysEnum.ERC20_CONTRACT, mockERC20Contract);
        generalUseUtil.setGlobalKey(globalKeysEnum.BATCH_TRANSFER_CONTRACT, mockBatchTransferContract);
        generalUseUtil.setGlobalKey(globalKeysEnum.PROVIDER, mockProvider);
        generalUseUtil.setGlobalKey(globalKeysEnum.SIGNER, mockSigner);
    });

    afterEach(() => {
        // Restore all spies after each test
        sinon.restore();
    });

    it('should approve tokens for batch transfer', async () => {
        const spender = '0xSpenderAddress';
        const amount = 100;

        // Call approveTokens
        const tx = await ethersLib.approveTokens(spender, amount);

        // Assert that approve was called on the ERC-20 contract
        expect(mockERC20Contract.approve.calledOnce).to.be.true;
        expect(mockERC20Contract.approve.firstCall.args[0]).to.equal(spender);
        expect(mockERC20Contract.approve.firstCall.args[1]).to.equal(ethers.parseUnits(amount.toString(), 18));

        // Assert that the logger function was called correctly
        expect(logWithColorSpy.calledWith('Tokens approved successfully!', loggerColourEnum.INFO)).to.be.true;
        expect(tx).to.deep.equal({ hash: '0xFakeTxHash' });
    });

    it('should execute ERC-20 batch transfer correctly', async () => {
        const recipients = ['0xRecipient1', '0xRecipient2'];
        const amounts = [100, 50];
        const tokenAddress = '0xTokenAddress';

        // Call executeBatchTransactions for ERC-20
        const tx = await ethersLib.executeBatchTransactions(recipients, amounts, tokenAddress);

        // Assert that batchTransfer was called on the batch contract
        expect(mockBatchTransferContract.batchTransfer.calledOnce).to.be.true;
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[0]).to.deep.equal(recipients);
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[1]).to.deep.equal(amounts);
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[2]).to.equal(tokenAddress);

        // Assert that the logger function was called correctly
        expect(logWithColorSpy.calledWith(`Batch ERC-20 Transfer tx hash: 0xFakeBatchTxHash`, loggerColourEnum.INFO)).to.be.true;
        expect(logWithColorSpy.calledWith('✅ ERC-20 Batch Transfer completed!', loggerColourEnum.INFO)).to.be.true;
        expect(tx).to.deep.equal({ hash: '0xFakeBatchTxHash' });
    });

    it('should execute native ETH batch transfer correctly', async () => {
        const recipients = ['0xRecipient1', '0xRecipient2'];
        const amounts = [0.1, 0.2];

        // Call executeBatchTransactions for native ETH
        const tx = await ethersLib.executeBatchTransactions(recipients, amounts, ethers.ZeroAddress, true);

        // Assert that batchTransfer was called on the batch contract
        expect(mockBatchTransferContract.batchTransfer.calledOnce).to.be.true;
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[0]).to.deep.equal(recipients);
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[1]).to.deep.equal(amounts);
        expect(mockBatchTransferContract.batchTransfer.firstCall.args[2]).to.equal(ethers.ZeroAddress);

        // Assert that the logger function was called correctly
        expect(logWithColorSpy.calledWith(`Batch Native Transfer tx hash: 0xFakeBatchTxHash`, loggerColourEnum.INFO)).to.be.true;
        expect(logWithColorSpy.calledWith('✅ Native Batch Transfer completed!', loggerColourEnum.INFO)).to.be.true;
        expect(tx).to.deep.equal({ hash: '0xFakeBatchTxHash' });
    });

    it('should throw an error if the recipients and amounts arrays are not the same length', async () => {
        const recipients = ['0xRecipient1', '0xRecipient2'];
        const amounts = [100]; // Mismatch in lengths

        // Expect an error to be thrown
        await expect(ethersLib.executeBatchTransactions(recipients, amounts, '0xTokenAddress'))
            .to.be.rejectedWith('ArraysLengthMismatch');
    });
});
