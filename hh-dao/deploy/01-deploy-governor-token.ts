import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployGovernanceToken: DeployFunction = async function(hre: HardhatRuntimeEnvironment){
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log(`-----Deploying Governance Token----------------`);

    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
    });

    log(`-----Deployed Governance Token to address: ${governanceToken.address}-------`);

    await delegate(governanceToken.address, deployer);

    log(`---Delegated---`);
}

//delegate vote - take my votes and vote how you want
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);

    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);// numCheckpoints is from ERC20Votes, can see how many checkpoints an account has.  
}

export default deployGovernanceToken;