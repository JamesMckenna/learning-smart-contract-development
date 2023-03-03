const { developmentChains } = require("../helper-hardhat-config.js");

module.exports = async function({ getNamedAccounts, deployments }){
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //https://docs.chain.link/docs/vrf/v2/supported-networks/#goerli-testnet
    //const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium. It cost 0.25 LINK pre request to this oracle
    const GAS_PRICE_LINK = 1e9; // LINK per gas. a calculated value base on the gas price of the chain
    //const GAS_PRICE_LINK = "1000000000000000000";
    const BASE_FEE = "250000000000000000";

    if(developmentChains.includes(network.name)){ 
        log("Local network detected, deploying mock");
        await deploy("VRFCoordinatorV2Mock", { from: deployer, log: true, args: [BASE_FEE, GAS_PRICE_LINK] });
        log("Mock deployed");
        log("You are deploying to a local network, you'll need a local network running to interact")
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        )
        log("--------------------------------------");
    }

}

module.exports.tags = ["all", "mocks"];