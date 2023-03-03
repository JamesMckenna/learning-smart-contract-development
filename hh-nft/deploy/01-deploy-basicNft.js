const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");
//yarn hardhat deploy

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("----------------------START BasicNFT------------------------------");
    log(`--------BasicNFT---Deployed to: ${network.name}--------------`);
    const args = [];
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });
    log("----------------------END BasicNFT------------------------------");

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`--------BasicNFT---Deployed to: ${network.name}--------------`);
        log("Verifing...");
        await verify(basicNFT.address, args);
        

    }
}

module.exports.tags = ["all", "basicnft", "main"];