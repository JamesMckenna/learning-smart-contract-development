const { ethers, network } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");

//yarn hardhat node will run through the deploy scripts
//in a new terminal, yarn hardhat run scripts/mint.js --network localhost

const mint = async () => {
    const basicNft = await ethers.getContract("BasicNFT");
    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    const address = basicNft.address;
    console.log("Appoving NFT...");

    if(network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
    console.log(`Newly minted token with Id: ${tokenId}, and address: ${address} has been appoved!`);
}


mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });