const { getNamedAccounts, ethers } = require("hardhat");
const AMOUNT = ethers.utils.parseEther("0.1");
async function getWeth(){
    const { deployer } = await getNamedAccounts();
    //an interface will gives us the basics of the abi (what functions a 3rd party contract has and that our script can call) 
    //then yarn hardhat compile to get an abi for the interface
    //IWeth contract address (mainnet): 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const iWeth = await ethers.getContractAt("IWeth", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", deployer);
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${wethBalance.toString()} WETH`);
}

module.exports = { getWeth, AMOUNT }