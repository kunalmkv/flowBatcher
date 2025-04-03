const { ethers } = require("ethers");
require("dotenv").config({path: "../.env"});
const provider = new ethers.JsonRpcProvider(process.env.ETH_NODE_URL);
const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

// Addresses
const gnosisSafeAddress = "0xa06c2b67e7435ce25a5969e49983ec3304d8e787";
const multiSendAddress = "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761";
const tokenAddress = "0xFD623F170D47850c3617e62324eBe4607e191F16";

// ABIs
const gnosisSafeABI = require("./src/abis/batch.transfer.abi.json");
const erc20TokenABI = require("./src/abis/erc20.token.abi.json");
const multiSendABI = [{"inputs":[{"internalType":"bytes","name":"transactions","type":"bytes"}],"name":"multiSend","outputs":[],"stateMutability":"payable","type":"function"}];

// Contracts
const gnosisSafe = new ethers.Contract(gnosisSafeAddress, gnosisSafeABI, signer);
const multiSend = new ethers.Contract(multiSendAddress, multiSendABI, signer);
const tokenContract = new ethers.Contract(tokenAddress, erc20TokenABI, signer);

async function approveTokens(tokenAddress, spender, amount) {
    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await tokenContract.approve(spender, parsedAmount);
    console.log("Approval tx sent:", tx.hash);
    await tx.wait();
    console.log("Tokens approved!");
}

async function batchTransferERC20(recipients, amounts) {
    // Approve tokens first
    const totalAmount = amounts.reduce((acc, val) => acc + val, 0);
    await approveTokens(tokenAddress, gnosisSafeAddress, totalAmount);

    const transactions = [];

    for (let i = 0; i < recipients.length; i++) {
        const amount = ethers.parseUnits(amounts[i].toString(), 18);
        const data = tokenContract.interface.encodeFunctionData("transfer", [recipients[i], amount]);

        transactions.push(
            ethers.solidityPacked(
                ["uint8", "address", "uint256", "uint256", "bytes"],
                [0, tokenAddress, 0, data.length, data]
            )
        );
    }

    const packedTxs = "0x" + transactions.map(t => t.slice(2)).join("");
    const multiSendData = multiSend.interface.encodeFunctionData("multiSend", [packedTxs]);

    const tx = await gnosisSafe.execTransaction(
        multiSendAddress,
        0,
        multiSendData,
        1,
        800000,
        0,
        0,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        "0x"
    );

    console.log("Batch tx sent:", tx.hash);
    await tx.wait();
    console.log("Batch completed!");
}

const recipients = [
    '0x93297d48A40446dc84a388BB94F3A1247CB74870',
    '0x50da5C365a08169A9101C1969492540dA937071F'
];
const amounts = [100, 50];

batchTransferERC20(recipients, amounts).catch(console.error);
