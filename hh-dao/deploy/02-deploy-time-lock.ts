import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MIN_DELAY } from "../helper-hardhat-config";

const deployTimeLock: DeployFunction = async function(hre: HardhatRuntimeEnvironment){
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log(`-----Deploying TimeLock----------------`);

    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: [MIN_DELAY, [], []],
        log: true,
    });

    log(`-----Deployed TimeLock to address: ${timeLock.address}-------`);
}

export default deployTimeLock;