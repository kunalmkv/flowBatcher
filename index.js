const { createProviderAndSigner } = require("./src/lib/ethers.lib.src");
const SDK = require("./src/sdk");
const  config = require("./src/config");
require("dotenv").config({path: "./.env"});

// Set up provider and signer using the utility function
const { provider, signer } = createProviderAndSigner(
    process.env.ETH_NODE_URL,
    process.env.WALLET_PRIVATE_KEY
);
// Initialize the SDK
const sdk = new SDK(provider, signer, config);

// Example to send ERC-20 in batch
const recipients = [
    "0x93297d48A40446dc84a388BB94F3A1247CB74870",
    "0x50da5C365a08169A9101C1969492540dA937071F"
];
const amounts = [100, 15];

//sdk.batchTransferERC20(recipients, amounts).catch(console.error);

// Example to send Native ETH in batch
 sdk.batchTransferNative(recipients, [0.1, 0.2]).catch(console.error);
