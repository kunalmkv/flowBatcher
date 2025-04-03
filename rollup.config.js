// rollup.config.js
const resolve = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")

module.exports = {
  input: "src/sdk.js", // Replace with the correct entry point for your SDK
  output: {
    file: "dist/ethers-batch-sdk.js",
    format: "umd", // Use 'umd' for universal module format
    name: "BatchSDK",
  },
  plugins: [resolve(), commonjs()],
}
