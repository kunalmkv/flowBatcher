const axios = require("axios")
const config = require("../config")

/**
 * Fetches the current price of Ethereum (ETH) in USD from the CoinGecko API.
 * This function makes an HTTP GET request to the CoinGecko API to retrieve the current ETH price in USD.
 *
 * @async
 * @returns {Promise<number>} - A promise that resolves with the ETH price in USD.
 *
 * @throws {Error} - Throws an error if the API request fails or if there is an issue fetching the price.
 */
async function getEthPriceInUsd() {
  try {
    const response = await axios.get(config.coinGeckoEthPriceInUSD)
    return response.data.ethereum.usd // Returns the ETH price in USD
  } catch (error) {
    throw error
  }
}

module.exports = {
  getEthPriceInUsd: getEthPriceInUsd,
}
