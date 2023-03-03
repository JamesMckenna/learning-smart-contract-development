const { verifyMessage } = require("ethers/lib/utils");
const { getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");


module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } =  deployments;
    const { deployer } = await getNamedAccounts();

    log(`----------------------------------`);
    const boxv2 = await deploy("BoxV2", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`Verifying contract ${boxv2} at address ${boxv2.address}`);
        await verify(boxv2.address, []);
    }
}