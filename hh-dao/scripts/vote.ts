import * as fs from "fs";
import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
import { network, ethers } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";

//yarn hardhat run scripts/vote.ts --network localhost
//yarn hardhat console --network localhost 
//copy paste into terminal: const governor = await ethers.getContract("GovernorContract");
//then: await governor.state("92079107007075724204970846328168414749714298344365948991786020344410098632293") SO: we are calling the state function on the GovernorContract in attempt to find the state of the propsal with Id 92079107007075724204970846328168414749714298344365948991786020344410098632293 SEE: proposals.json


async function main(){
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[network.config.chainId!].at(-1);// Get the last proposal for the network. You could also change it for your index
    //0 = against, 1 = for, 2 = abstain
    const voteWay = 1;
    const governor = await ethers.getContract("GovernorContract");
    const reason = "I voted that way just because I am ignorant and don't care enough to do the required research to become informed."
    const txResponse = await governor.castVoteWithReason(proposalId, voteWay, reason);
    await txResponse.wait(1);

    if(developmentChains.includes(network.name)){
        await moveBlocks(VOTING_PERIOD +1);
    }

    console.log(`Voted, ready to go......`);
    const proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
})