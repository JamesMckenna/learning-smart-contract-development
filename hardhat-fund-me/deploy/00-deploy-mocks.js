//used for hardhat or localhost networks
const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

//yarn hardhat deploy --tags mocks
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, logs } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //if (developmentChains.includes(network.name)){ //both network.name and chainId will work 
    if (chainId == "31337"){
        console.log("Local network detected, deploying mocks");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        });
    }
    console.log("Mocks deployed");
    console.log("---------------------------------");
}

module.exports.tags = ["all", "mocks"];