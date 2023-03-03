import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../helper-hardhat-config";

const deployGovernorContract: DeployFunction = async function(hre: HardhatRuntimeEnvironment){
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const governanceToken = await get("GovernanceToken");
    const timeLock = await get("TimeLock");

    log(`-----Deploying Governor Contract----------------`);

    const governanceContract = await deploy("GovernorContract", {
        from: deployer,
        args: [governanceToken.address, timeLock.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE], //Constructor args
        log: true,
    });

    log(`-----Deployed TimeLock to address: ${governanceContract.address}-------`);
}

export default deployGovernorContract;