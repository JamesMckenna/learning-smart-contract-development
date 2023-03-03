const { ethers } = require("hardhat");

const networkConfig = {
    0x5: {
        name: "goerli",
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.1"),
        gweiKeyHash_30: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "1749",
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: ethers.utils.parseEther("0.01"), 
        //mintFee: "10000000000000000"
        ethToUsdPriceFeedGoerliAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", //https://docs.chain.link/docs/data-feeds/price-feeds/addresses/#Goerli%20Testnet
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.1"),
        //entranceFee: "100000000000000000",//0.1 Eth
        gweiKeyHash_30: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",//a.k.a gasLane in smart contract constructor https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: ethers.utils.parseEther("0.01"), //"10000000000000000" or 1e17
        //mintFee: "10000000000000000"
    }
}

const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
}
