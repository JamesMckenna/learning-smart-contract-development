const { ethers, getNamedAccounts } = require("hardhat");
const fs = require("fs-extra")
const { resolve } = require('path');
//Mints the HardhatBasicsNFT Certificate
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"HardhatBasicsNFT__WrongValue","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"TOKEN_IMAGE_URI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTokenCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"valueAtStorageLocationSevenSevenSeven","type":"uint256"}],"name":"mintNft","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const address = "0xB29eA9ad260B6DC980513bbA29051570b2115110";
//https://arbiscan.io/address/0xda4a7da4397414c089062cf6256989d2c29e31c9
//https://ipfs.io/ipfs/QmSpGCsdZY9Vo9ZoQhPZvRyyo5KzziAZpKbnoj8ZBsiBAE
//1000000000000000000

//https://arbiscan.io/tx/0x46eeb703936a3826ba17b0c79923754a74939948c1c7a5203adb3cc3542b54bd#eventlog
//https://arbiscan.io/address/0xe2beae512697913951cdd85db49545b077a90699#tokentxns
//https://arbiscan.io/tx/0x5425d899ea129b1af8dd5978c6ac1ae2ae8932722295c7a913ac160bc9fe5bca
//https://arbiscan.io/tx/0x4705d951288560096cae23352f6f784ad202421eb861ed2e098bee0264138958
//https://arbiscan.io/tx/0x46eeb703936a3826ba17b0c79923754a74939948c1c7a5203adb3cc3542b54bd


//https://stratosnft.io/patrickalphac?tab=0&collections=collection%3D0xda4a7Da4397414C089062cf6256989d2C29E31c9


//Contract
//https://arbiscan.io/address/0x5ecedc30224d9b3b5ee4c2d7ed17c197cb1d263b?a=0xda4a7da4397414c089062cf6256989d2c29e31c9
//https://arbiscan.io/address/0xda4a7da4397414c089062cf6256989d2c29e31c9#code
//https://arbiscan.io/address/0x9e9a4e58ddc9483d241afc9a028e89bd9b9fa683#code

//https://arbiscan.io/tx/0x39c421df0f0b79da006fbd4e5df77cbe92d28fe771b2d8aa3a14d6953c6ac12f


//FLEEK
//NFT.Storage
//Web3.Storage
//Textile Powergate
//OrbitDB
async function main() {
    const { deployer } = await getNamedAccounts()
    const contract = await ethers.getContractAt(abi, address, deployer)
    let response = await ethers.provider.getStorageAt(contract.address, 777)
    console.log(response)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })