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
    const DECIMALS = "18";
    const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether");

    if(developmentChains.includes(network.name)){ 
        log("Local network detected, deploying mock");
        await deploy("VRFCoordinatorV2Mock", { from: deployer, log: true, args: [BASE_FEE, GAS_PRICE_LINK] });
        log("VRFCoordinatorV2Mock deployed to %s, will need to use yarn hardhat node terminal command to interact with the mocked smart contract", network.name);
        log("");

        await deploy("MockV3Aggregator", {from: deployer, log: true, args: [DECIMALS, INITIAL_PRICE] });
        log("MockV3Aggregator deployed to %s, will need to use yarn hardhat node terminal command to interact with the mocked smart contract", network.name);
        log("");
        
        log( "Please run `yarn hardhat console --network %s` to interact with the deployed smart contracts!", network.name)
        log("--------------------------------------");
    }

}

module.exports.tags = ["all", "mocks"];