import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, ADDRESS_ZERO } from "../helper-hardhat-config";

const setupGovernanceContract: DeployFunction = async function(hre: HardhatRuntimeEnvironment){
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const timeLock = await ethers.getContract("TimeLock", deployer);
    const governor = await ethers.getContract("GovernorContract", deployer);

    log(`-----Setting up contract roles ----------------`);//set up so only the governor can send to timelock
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const timelockAdminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);//governor is the only one that can do anything
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);//give executor role to no one specific, anybody can execute once timelock.delay is exceeded
    await executorTx.wait(1);
    //right now the depolyer account owns, but we gave everyone access, so revoke the deployer's ownership
    const revokeTx = await timeLock.revokeRole(timelockAdminRole, deployer);
    await revokeTx.wait(1);
    //Now anything the timelock wants to do has to go through Governance
}

export default setupGovernanceContract;