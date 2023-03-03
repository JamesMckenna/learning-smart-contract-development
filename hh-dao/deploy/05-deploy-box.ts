import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployBox: DeployFunction = async function(hre: HardhatRuntimeEnvironment){
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log(`-----Deploying Box----------------`);

    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
    });

    const timeLock = await ethers.getContract("TimeLock");
    const boxContract = await ethers.getContractAt("Box", box.address);
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
    await transferOwnerTx.wait(1);

    log(`--Deployed Box contract to address: ${box.address} and given ownership to Timelock at address ${timeLock.address}---`);
}

export default deployBox;