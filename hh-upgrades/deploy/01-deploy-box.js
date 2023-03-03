const { verifyMessage } = require("ethers/lib/utils");
const { getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

//yarn hardhat deploy - when we deploy, this will deploy multiple contracts (BoxProxyAdmin, Box_Implementation, Box_Proxy) and rename Box.sol to Box_Proxy.sol
//BoxProxyAdmin contract owns Box_Proxy contract, that calls Box_Implementation contract.
//Recall that Box_Proxy will has storage and it follows the EIP-1967. Think of it as a kinda of fill-with-anything that the implementation-contract's function returns. 

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } =  deployments;
    const { deployer } = await getNamedAccounts();

    log(`----------------------------------`);
    //Set up so that BoxProxyAdmin owns the BoxProxy contract
    //Some links
    //https://github.com/wighawag/hardhat-deploy#deploying-and-upgrading-proxies
    //https://docs.openzeppelin.com/upgrades-plugins/1.x/
    //https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580
    //https://github.com/wighawag/template-ethereum-contracts/tree/examples/openzeppelin-proxies/deploy
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
        proxy:{
            proxyContract: "OpenZeppelinTransparentProxy",
            viaAdminContract: {
                name: "BoxProxyAdmin",
                artifact: "BoxProxyAdmin"
            }
         } 
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log(`Verifying contract ${box} at address ${box.address}`);
        await verify(box.address, []);
    }
}