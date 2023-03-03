
/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("dotenv").config();

const goerliRpcUrl = process.env.GOERLI_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const goerliChainId = process.env.GOERLI_CHAIN_ID;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const coinmarketcapApiKey = process.env.COINMARKET_API_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    goerli: {
      url: goerliRpcUrl,
      accounts: [`${privateKey}`],
      chainId: Number(goerliChainId),
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts: give in the console from running npx hardhat node
      chainId: 31337,
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161
    }
  },
  etherscan:{
    apiKey: etherscanApiKey
  },
  solidity: {
    compilers: [{version: "0.8.9"}, {version: "0.8.0"}, {version: "0.6.0"}, {version: "0.6.6"}]
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    //coinmarketcap: coinmarketcapApiKey
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0
    }
  }
};
