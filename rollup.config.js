const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json'); // Required for JSON files

module.exports = {
  input: 'src/sdk.js',  // Path to your main entry file for the SDK
  output: {
    file: 'dist/flowBatcher.js',
    format: 'umd',       // Universal Module Definition format
    name: 'BatchSDK',     // The global name for UMD
  },
  plugins: [
    resolve(),            // Resolves external dependencies in node_modules
    commonjs(),           // Converts CommonJS modules to ES6 modules
    json(),               // Enables importing of JSON files
  ],
};
