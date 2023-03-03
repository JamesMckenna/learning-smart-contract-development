//to run deploy-mocks - yarn hardhat deploy --tags mocks
// yarn hardhat deploy --network goerli
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, logs } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    
    let ethUsdPriceFeedAddress;
    if (chainId == "31337"){
        //When working on localhost or hardhat network we want to use a mock
        //if the contract doesn't exist, we deploy a minimal version (a mock contract that we need as a dependency) of for our local testing
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }
    else
    {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress]
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundme.address, args)
    }
}
module.exports.tags = ["all", "fundme"]