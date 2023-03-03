import { ethers, network } from "hardhat";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

//yarn hardhat node
//in new terminal, yarn hardhat run scripts/propose.ts --network localhost
export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    const governor = await ethers.getContract("GovernorContract");
    const box = await ethers.getContract("Box");

    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)// encodeFunctionData() SEE: ethers docs

    console.log(`(contract's function selector) encodedFunctionCall bytes: ${encodedFunctionCall}`);
    console.log(`Proposing ${functionToCall} on ${box.address}, with args: ${args}`);
    console.log(`Proposing Description: \n ${proposalDescription}`);

    const proposeTx = await governor.propose([box.address], [0], [encodedFunctionCall], proposalDescription);//this propose is from GovernorContract.sol
    const proposeReceipt = await proposeTx.wait(1); 

    if(developmentChains.includes(network.name)){
        await moveBlocks(VOTING_DELAY +1);
    }



    const proposalId = await proposeReceipt.events[0].args.proposalId;
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    proposals[network.config.chainId!.toString()].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals));

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)
    // save the proposalId
    //storeProposalId(proposalId);
  
    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

function storeProposalId(proposalId: any) {
    const chainId = network.config.chainId!.toString();
    let proposals:any;
  
    if (fs.existsSync(proposalsFile)) {
        proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    } else {
        proposals = { };
        proposals[chainId] = [];
    }   
    proposals[chainId].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => { 
        console.log(error); 
        process.exit(1);
    });