const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 0;

async function buyItem(){
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    const basicNft = await ethers.getContract("BasicNFT");
    const listing = await nftMarketPlace.getListing(basicNft.address, TOKEN_ID);
    const price = listing.price.toString();
    const tx = await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: price });
    await tx.wait(1);
    console.log(`Bought NFT`);
    if(network.config.chainId == "31337"){
        await moveBlocks(2, {sleepAmount: 1000});
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })