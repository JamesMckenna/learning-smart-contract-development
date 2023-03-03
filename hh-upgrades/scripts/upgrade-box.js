//the manual way, but hardhat has a way of doing it auto 

const { ethers } = require("hardhat");
//yarn hardhat node
//yarn hardhat run scripts/upgrade-box.js --network localhost

async function main() {
    const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin");
    const transparentProxy = await ethers.getContract("Box_Proxy");//recall that when deployed, openzeppelin/hardhat renames ContractName to ContactName_Proxy

    const proxyBoxV1 = await ethers.getContractAt("Box", transparentProxy.address);//Call implementation of Box, but call it from Box_Proxy.address 
    const version1 = await proxyBoxV1.version();
    console.log(`before upgrade, proxyBox version ${version1} at callable address: ${proxyBoxV1.address}`);

    console.log(`Upgrading from Box to BoxV2. Notice after upgrade, the calling address is the same (Box_Proxy address) but a different version number`);
    const boxv2 = await ethers.getContract("BoxV2");
    const upgradeTx = await boxProxyAdmin.upgrade(transparentProxy.address, boxv2.address);//the upgrade function is from the openzeppelin ProxyAdmin.sol that we inherit in contract BoxProxyAdmin is ProxyAdmin(){} 
    await upgradeTx.wait(1);

    const proxyBoxV2 = await ethers.getContractAt("BoxV2", transparentProxy.address);//Call implementation of BoxV2, but call it from Box_Proxy.address 
    const version2 = await proxyBoxV2.version();
    console.log(`proxyBoxV2 version ${version2} at callable address: ${proxyBoxV2.address}`);
    console.log(`Any Box contract function specifier, will still call through the Box_Proxy contract, but now use BoxV2 code implementation, (assuming Box and BoxV2 have the same function/function signature).`);
    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });