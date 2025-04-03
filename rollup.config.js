import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/sdk.js',  // Main entry point for the SDK
    output: {
        file: 'dist/ethers-batch-sdk.js',
        format: 'umd',
        name: 'BatchSDK',
    },
    plugins: [resolve(), commonjs()],
};
