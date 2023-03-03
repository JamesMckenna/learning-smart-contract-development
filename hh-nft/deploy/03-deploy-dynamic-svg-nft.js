const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");
const { storeImages, storeTokenURIMetadata } = require("../utils/uploadToPinata");
require("dotenv").config();
const fs = require("fs");

//yarn hardhat deploy --tags dynamicSVGNFT,mocks
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let ethToUsdPriceFeedAddress;

    if(developmentChains.includes(network.name)) {
        const EthToUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethToUsdPriceFeedAddress = EthToUsdAggregator.address;

    } else {
        ethToUsdPriceFeedAddress = networkConfig[chainId].ethToUsdPriceFeedGoerliAddress;
    }

    const lowSVG = fs.readFileSync("./images/frown.svg", {encoding: "utf8"});
    const highSVG = fs.readFileSync("./images/happy.svg", {encoding: "utf8"});
    const args = [ethToUsdPriceFeedAddress, lowSVG, highSVG];
    const dynamicSVGNFT = await deploy("DynamicSVGNFT", {from: deployer, args: args, log: true, waitConfimations: network.config.blockConfirmations || 1});

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`--------DynamicSVGNFT---Deployed to: ${network.name}--------------`);
        log("Verifing...");
        await verify(dynamicSVGNFT.address, args);
        log("----------------------------------------------------");

    }
}

module.exports.tags = ["all", "dynamicSVGNFT", "main"];