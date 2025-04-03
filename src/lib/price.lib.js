const axios = require("axios")
const config = require("../config")

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
