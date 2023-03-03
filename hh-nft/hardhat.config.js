require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();


const goerliRpcUrl = process.env.GOERLI_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const goerliChainId = process.env.GOERLI_CHAIN_ID;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const coinmarketcapApiKey = process.env.COINMARKET_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
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
      blockConfirmations: 1,
    }
  },
  etherscan:{
    apiKey: etherscanApiKey
  },
  solidity: {
    compilers: [{version: "0.8.17"}, {version: "0.8.0"}, {version: "0.6.6"}]
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: coinmarketcapApiKey
  },
  mocha: {
    timeout: 600000, //300 seconds
  }
};
