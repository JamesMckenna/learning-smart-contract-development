const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } =  require("../utils/verify");

//yarn hardhat deploy


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = []; //No constructor args needed for NftMarketPlace contract

    const nftMarketPlace = await deploy("NftMarketPlace", { from: deployer, args: args, log: true, waitConfirmations: network.config.blockConfirmations || 1 });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`Verifing deployment on ${network.name}`);
        await verify(nftMarketPlace.address, args);
    }

    log("------------------------------------");
}

module.exports.tags = ["all", "nftmarketplace"];