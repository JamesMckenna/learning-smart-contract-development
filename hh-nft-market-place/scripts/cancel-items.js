const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
//yarn hardhat run scripts/cancel-item.js --network localhost
const TOKEN_ID = 0;

async function cancel(){
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    const basicNft = await ethers.getContract("BasicNFT");
    const tx = await nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID);
    await tx.wait(1);
    console.log(`NFT Canceled`);
    if(network.config.chainId == "31337"){
        await moveBlocks(2, (sleepAmount = 1000));
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })