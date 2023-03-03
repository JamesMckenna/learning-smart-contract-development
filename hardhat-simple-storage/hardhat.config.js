require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");

const goerliRpcUrl = process.env.GOERLI_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const goerliChainId = process.env.GOERLI_CHAIN_ID;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const coinmarketcapApiKey = process.env.COINMARKET_API_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: goerliRpcUrl,
      accounts: [privateKey],
      chainID: goerliChainId,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts: give in the console from running npx hardhat node
      chainID: 31337,
    }
  },
  etherscan:{
    apiKey: etherscanApiKey
  },
  solidity: "0.8.9",
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: coinmarketcapApiKey
  }
};
