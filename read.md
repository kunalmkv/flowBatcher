# flowBatcher SDK

## Overview
This SDK simplifies the process of transferring ERC-20 tokens and native Ethereum (ETH) to multiple recipients in a single transaction. By bundling transactions, it helps save on gas fees and improves transaction efficiency.

## Problem Statement
Transferring tokens or native Ethereum (ETH) to multiple addresses is often inefficient and costly, especially when multiple transactions incur separate gas fees. This SDK optimizes the process by allowing batch transfers of tokens and ETH in a single operation, making it more cost-effective and convenient.

![flowBatcher Image](src/images/flowBatcher.png)

## System Flow
1. **User Inputs**: The user provides recipient addresses and amounts of ERC-20 tokens or ETH.
2. **Gas Estimation**: The SDK estimates the gas fees required for the batch transfer and notifies the user of the estimated cost in both ETH and USD.
3. **User Confirmation**: The user is prompted for confirmation to proceed with the batch transfer.
4. **Token Approval**: For ERC-20 tokens, the SDK calls the `approve` method to allow the contract to transfer tokens on behalf of the user.
5. **Batch Transfer Execution**: The SDK sends the batch transfer of ERC-20 tokens or ETH to all recipients in one transaction.

## Features
- **Batch Transfer of ERC-20 Tokens**: Send ERC-20 tokens to multiple recipients with one transaction.
- **Batch Transfer of Native Ethereum (ETH)**: Transfer ETH to multiple addresses with a single transaction.
- **Gas Estimation**: Calculate the gas required for the batch transfer.
- **User Interaction**: Confirm the transfer before executing to ensure control over large transactions.
- **Cross-platform Support**: Works with both ERC-20 tokens and native Ethereum (ETH).

## Security Enhancements
- **Reentrancy Guard**: 
  - The contract uses OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.
  - The `nonReentrant` modifier ensures batch transfers cannot be called in a reentrant manner.
- **ETH Transfer Validation**:
  - The contract verifies that the total Ether sent (`msg.value`) matches the sum of amounts.
  - This prevents accidental overpayment or underpayment.
- **Token Transfer Optimization**:
  - Instead of using `transferFrom`, the contract directly calls `transfer` when it's the sender to save gas.
  - Example: `IERC20(token).transferFrom(msg.sender, recipients[i], amounts[i]);` was optimized to `token.transferFrom(msg.sender, recipients[i], amounts[i]);`.
- **Helper Function (`sumAmounts`)**:
  - Calculates the total ETH being sent in a batch, reducing redundancy and improving efficiency.

## Efficiency Enhancements
- **Gas Optimization**:
  - Instead of repeatedly summing amounts inside loops, a separate helper function precomputes the total amount.
  - This reduces the computational cost of the main function.
- **Reduced Redundant Calls**:
  - By minimizing external contract calls and ensuring efficient batching, gas fees are further reduced.

## Functionality
### `batchTransferERC20(recipients, amounts)`
Transfers ERC-20 tokens to multiple recipients in a single transaction.

#### Parameters:
- `recipients`: Array of recipient addresses.
- `amounts`: Array of amounts to send to each recipient.

#### Response:
- **Success**: Returns the transaction hash and logs completion.
- **Error**: Throws an error if invalid recipients or amounts are provided.

#### Example:
```javascript
const recipients = ["0xRecipient1", "0xRecipient2"];
const amounts = [10, 5];
await sdk.batchTransferERC20(recipients, amounts);
```

### `batchTransferNative(recipients, amounts)`
Transfers native ETH to multiple recipients in one batch transaction.

#### Parameters:
- `recipients`: Array of recipient addresses.
- `amounts`: Array of amounts of ETH to send to each recipient.

#### Response:
- **Success**: Returns the transaction hash and logs completion.
- **Error**: Throws an error if the recipient list or amounts are invalid.

#### Example:
```javascript
const recipients = ["0xRecipient1", "0xRecipient2"];
const amounts = [0.1, 0.2];
await sdk.batchTransferNative(recipients, amounts);
```

### `estimateGasFees(recipients, amounts, tokenAddress, isNative)`
Estimates the gas fees for the batch transfer of ERC-20 tokens or native ETH.

#### Parameters:
- `recipients`: Array of recipient addresses.
- `amounts`: Array of amounts to transfer.
- `tokenAddress`: The ERC-20 token address (use `ethers.ZeroAddress` for ETH).
- `isNative`: Boolean to specify if the transfer is native ETH.

#### Response:
- **Success**: Returns the estimated gas, gas price, and cost in both ETH and USD.
- **Error**: Throws an error if gas estimation fails.

#### Example:
```javascript
const gasEstimate = await estimateGasFees(recipients, amounts, tokenAddress, true);
console.log(gasEstimate);
```

## Coding Practices
- **Modular Code Structure**: The SDK follows a modular architecture for easy debugging and scalability.
- **Code Linting**: Uses `eslint` with strict rules (`--max-warnings=0`) to enforce clean code.
- **Prettier Formatting**: Ensures consistent code styling using `prettier . --write`.
- **Error Handling**: Implements proper error handling with `try-catch` blocks to prevent unexpected failures.
- **Unit Testing**: Uses Mocha and Chai for comprehensive test coverage.

## Coding Standards & Dependencies
- **Coding Standards**:
  - Uses modern JavaScript (ES6+).
  - Consistent naming conventions (`camelCase` for variables, `PascalCase` for classes).
  - Modular functions for improved maintainability.
- **Key Dependencies**:
  - `ethers`: Used for blockchain interactions.
  - `axios`: HTTP client for API calls.
  - `eslint`, `prettier`: Code quality tools.
  - `mocha`, `chai`, `sinon`: Testing libraries.
  - `dotenv`: Manages environment variables.
- **Build Tools**:
  - `rollup`: Used for bundling the SDK.
  - Plugins like `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, and `@rollup/plugin-json` ensure smooth module resolution.

## License
This SDK is open-source and available under the MIT License.

