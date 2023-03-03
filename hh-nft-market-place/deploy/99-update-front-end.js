const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractsFile = "../hh-nft-market-place-thegraph-ui/constants/networkMapping.json";
const frontEndABIFile = "../hh-nft-market-place-thegraph-ui/constants/";
//yarn hardhat deploy --network localhost --tags frontend

module.exports = async () => {
    if(process.env.UPDATE_FRONT_END){
        console.log("Updating Frontend");
        await updateContractAddresses();
        await updateABI();
    }
}

async function updateABI() {
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    fs.writeFileSync(`${frontEndABIFile}NFTMarketplace.json`, nftMarketPlace.interface.format(ethers.utils.FormatTypes.json));

    const basicNft = await ethers.getContract("BasicNFT");
    fs.writeFileSync(`${frontEndABIFile}BasicNFT.json`, basicNft.interface.format(ethers.utils.FormatTypes.json));//the .interface is from hardhat, not ethers
}

const updateContractAddresses = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    const chainId = network.config.chainId.toString();
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));

    if(chainId in contractAddresses){
        if(!contractAddresses[chainId]["NftMarketPlace"].includes(nftMarketPlace.address)){
            contractAddresses[chainId]["NftMarketPlace"].push(nftMarketPlace.address);
        }
    }
    else{
        contractAddresses[chainId] = { NftMarketPlace: [nftMarketPlace.address] };
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];