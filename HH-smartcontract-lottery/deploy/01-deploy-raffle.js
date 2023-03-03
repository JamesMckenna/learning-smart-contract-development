const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
//const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");
const VRF_SUB_FUND_AMOUNT = "1000000000000000000000";
const { verify } = require("../utils/verify.js");

module.exports = async function({ getNamedAccounts, deployments }){
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let vrfCoordinatorV2Address, subscriptionId;
    //if(developmentChains.includes(network.name)){
    if(chainId == 31337){
        console.log(`Deploying to ${network.name}`);
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReciept = await transactionResponse.wait(1);
        subscriptionId = transactionReciept.events[0].args.subId; //VRFCoordinatorV2Mock emits an event that will return a subId
        console.log(`vrf subId ${subscriptionId}`);
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    }
    else{
        console.log(`Deploying to ${network.name}`);
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinator"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }
    const entranceFee = networkConfig[chainId]["entranceFee"];
    const gasLane = networkConfig[chainId]["gweiKeyHash_30"]; //recall that gasLane and Key Hash for chainlink oracles are synonomous - https://docs.chain.link/docs/vrf/v2/supported-networks/#goerli-testnet
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    const interval = networkConfig[chainId]["interval"];

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval];
    const raffle = await deploy("Raffle", { from: deployer, args: args, log: true, waitConfirmations: network.config.blockConfirmations || 1});

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying...");
        await verify(raffle.address, args);
    }

    log("----------------------------------");
}

module.exports.tags = ["all", "raffle"];