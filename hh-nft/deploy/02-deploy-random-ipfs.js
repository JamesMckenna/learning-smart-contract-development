const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");
const { storeImages, storeTokenURIMetadata } = require("../utils/uploadToPinata");
require("dotenv").config();

//yarn hardhat deploy
//yarn hardhat deploy --tags randomIPFS,mocks
const images = "images";
const metadataTemplate = {
    name: "",
    description: "",
    imageURI: "",
    attribute: [
        {
            trait_type: "Cuteness",
            value: -70
        },
        {
            trait_type: "Evilness",
            value: 70
        }
    ]
}

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const FUND_AMOUNT = "1000000000000000000";
    //1) to our own IPFS node, SEE: IPFS docs for a way to do it programatically 
    //2) Pinata www.pinata.cloud,  used for this demo
    //3) NFT.storage www.nft.storage. There is a script for NFT.Storage here: https://github.com/PatrickAlphaC/hardhat-nft-fcc/blob/main/utils/uploadToNftStorage.js
    
    //Upload to an ipfs node (pinata) and get CID from ipfs node before passing to RandomIpfsNft.sol constructor.
    let tokenURIs;
    if(process.env.UPLOAD_TO_PINATA == "true"){
        //Currently set in .env UPLOAD_TO_PINATA=false, set to true to hit this if statement
        tokenURIs = await handleTokenURIs();
    }
    else{
        //If already has CID - we pass to smart contract to use
        tokenURIs = [
            'ipfs://QmQyQiDfMUXSf6L9sBmZ1rBTiAjXHSqZwCymBT8gDnmpau',
            'ipfs://QmYHfDaAZAguKmbYQ8RnXVpibDuhHhqj45Bh3cVxk46btn',
            'ipfs://QmUEktULnwj5piy9fejgWKBq3L2SYLCUALwTT2B1PuT6aM'
        ];
    }


    let vrfCoordinatorV2Address, subscriptionId;
    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReciept = await tx.wait(1);
        subscriptionId = txReciept.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
        console.log(`Deploying to ${network.name}`);
    }else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinator;
        subscriptionId = networkConfig[chainId].subscriptionId;
        console.log(`Deploying to ${network.name}`);
    }
    log(`-----------RandomIpfsNft------Deploying to ${network.name}--------`);

    const args = [vrfCoordinatorV2Address, subscriptionId, networkConfig[chainId].gweiKeyHash_30, networkConfig[chainId].callbackGasLimit, tokenURIs, networkConfig[chainId].mintFee];
    const randomIpfsNft = await deploy("RandomIpfsNft", { from: deployer, args: args, log: true, waitConfirmations: network.config.blockConfirmations || 1});

    //NOT PART OF LESSON, but 2 test were failing until I found this on https://ethereum.stackexchange.com/questions/131426/chainlink-keepers-getting-invalidconsumer, 
    //weird thing is, they passed when doing this lesson, but failed when testing all tests (BasicNFT, RandomIpfsNft, DynamicSVGNFT) for next lesson (DynamicSVGNFT). 
    //had to come back and add this if conditional to get tests to pass. According to PatrickAlphaC, the vrfCoordinatorV2Mock.createSubscription(), is supposed to also vrfCoordinatorV2.addConsumer(args).
    if(developmentChains.includes(network.name)){ 
        const vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
        await vrfCoordinatorV2.addConsumer(subscriptionId, randomIpfsNft.address);
    }
    
    log("----------------------------------------------------");

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`--------RandomIpfsNft---Deployed to: ${network.name}--------------`);
        log("Verifing...");
        await verify(randomIpfsNft.address, args);
        log("----------------------------------------------------");

    }
}

const metadataOptions = {
    pinataMetadata: {
        name: "",
    },
    pinataOptions: {
        cidVersion: 0
    }
}

async function handleTokenURIs(){
    tokenURIs = [];
    const {responses: imageUploadResponses, files } = await storeImages(images);
    for (imageUploadRepsonseIndex in imageUploadResponses) {
        let tokenURIMetadata = { ...metadataTemplate };
        tokenURIMetadata.name = files[imageUploadRepsonseIndex].replace(".jpg", "");
        tokenURIMetadata.description = `Image of a ${tokenURIMetadata.name}`;
        tokenURIMetadata.imageURI = `ipfs://${imageUploadResponses[imageUploadRepsonseIndex].IpfsHash}`;
        const tokenURIMetadataOptions = { ...metadataOptions };
        tokenURIMetadataOptions.pinataMetadata.name = `${tokenURIMetadata.name}-metadata`;
        const metadataUploadResponse = await storeTokenURIMetadata(tokenURIMetadata, tokenURIMetadataOptions);
        tokenURIs.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token URIs are: ")
    console.log(tokenURIs);
    return tokenURIs;
}


module.exports.tags = ["all", "randomipfs", "main"];