const { ethers } = require("ethers");
const readline = require("readline");

// Provider & Wallet setup
const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const signer = new ethers.Wallet("0c6609ea81dc95c923d4b6e4f381e8afdd744ea59aa555fef7b4eddeca76fe95", provider);

console.log(provider, "provider inside custom");
console.log(signer, "signer inside custom");
// Addresses (Replace these accordingly)
const batchTransferAddress = "0x50De027232703e37fd7AB5CD92066B8992898aF4";
const tokenAddress = "0xFD623F170D47850c3617e62324eBe4607e191F16";

// ABI Definitions
const tokenABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "initialSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "allowance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "approver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const batchTransferABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "recipientsLength",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountsLength",
                "type": "uint256"
            }
        ],
        "name": "ArraysLengthMismatch",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ERC20Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "NativeTransfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            },
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            }
        ],
        "name": "batchTransfer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

// Contract instances
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
const batchTransferContract = new ethers.Contract(batchTransferAddress, batchTransferABI, signer);

// Helper function to prompt user confirmation
function promptUser(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => {
        rl.close();
        resolve(ans);
    }));
}

// Approve tokens function
async function approveTokens(spender, amount) {
    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await tokenContract.approve(spender, parsedAmount);
    console.log("Approval tx hash:", tx.hash);
    await tx.wait();
    console.log("Tokens approved successfully!");
}

// Estimate Gas Fees
async function estimateGasFees(recipients, amounts, tokenAddress, isNative = false) {
    const decimals = isNative ? 18 : await tokenContract.decimals();
    const parsedAmounts = amounts.map(a => ethers.parseUnits(a.toString(), decimals));
    const totalAmount = parsedAmounts.reduce((a, b) => a + b, ethers.parseUnits("0", decimals));
    console.log(batchTransferContract, "batchTransferContract111")
    console.log(recipients, parsedAmounts, tokenAddress, "populate bc")
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

// Batch Transfer ERC20 Tokens (with confirmation)
async function batchTransferERC20(recipients, amounts) {
    const totalAmount = amounts.reduce((sum, val) => sum + val, 0);

    // Approve tokens first
    await approveTokens(batchTransferAddress, totalAmount);

    // Estimate gas fees
    const gasEstimate = await estimateGasFees(recipients, amounts, tokenAddress);
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

    const decimals = await tokenContract.decimals();
    const parsedAmounts = amounts.map(a => ethers.parseUnits(a.toString(), decimals));

    const tx = await batchTransferContract.batchTransfer(recipients, parsedAmounts, tokenAddress);
    console.log("Batch ERC-20 Transfer tx hash:", tx.hash);
    await tx.wait();
    console.log("✅ ERC-20 Batch Transfer completed!");
}

// Batch Transfer Native ETH (with confirmation)
async function batchTransferNative(recipients, amounts) {
    const parsedAmounts = amounts.map(a => ethers.parseEther(a.toString()));
    const totalAmount = parsedAmounts.reduce((sum, val) => sum + val, ethers.parseEther("0"));

    // Estimate gas fees
    const gasEstimate = await estimateGasFees(recipients, amounts, ethers.ZeroAddress, true);
    console.log("\n🚨 GAS FEE ESTIMATE FOR NATIVE ETH BATCH TRANSFER:");
    console.log(`- Estimated Gas: ${gasEstimate.estimatedGas}`);
    console.log(`- Gas Price (gwei): ${gasEstimate.gasPrice}`);
    console.log(`- Estimated Cost (ETH): ${gasEstimate.estimatedCost}\n`);

    // Confirm from user
    const confirm = await promptUser("Proceed with Native ETH Batch Transfer? (yes/no): ");
    if (confirm.toLowerCase() !== "yes") {
        console.log("🚫 Transaction cancelled by user.");
        return;
    }

    const tx = await batchTransferContract.batchTransfer(
        recipients, parsedAmounts, ethers.ZeroAddress, { value: totalAmount }
    );
    console.log("Batch Native ETH Transfer tx hash:", tx.hash);
    await tx.wait();
    console.log("✅ Native ETH Batch Transfer completed!");
}

// Example usage:
const recipients = [
    "0x93297d48A40446dc84a388BB94F3A1247CB74870",
    "0x50da5C365a08169A9101C1969492540dA937071F"
];

// Run ERC-20 example (transferring 100 & 50 tokens)
batchTransferERC20(recipients, [10, 5]).catch(console.error);

// Uncomment to run Native ETH example (transferring 0.1 & 0.2 ETH)
// batchTransferNative(recipients, [0.1, 0.2]).catch(console.error);
