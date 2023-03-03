const { ethers, network } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.1");
//yarn hardhat node will run through the deploy scripts
//in a new terminal, yarn hardhat run scripts/mint-and-list.js --network localhost

const mintAndList = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    const basicNft = await ethers.getContract("BasicNFT");
    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    console.log("Appoving NFT...");

    const approvalTx = await basicNft.approve(nftMarketPlace.address, tokenId);
    await approvalTx.wait(1);
    console.log("Listing NFT...");
    const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE);
    await tx.wait(1);
    console.log("Listed");

    if(network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}



mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });