// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
//We want to wait for a new vote to be "executed"
//Give time to users to get out if they don't want to be part of the governance changes
//Once a proposal passes, wait some time before it goes into effect so people can opt-out

//This TimeLock contract owns all other contracts 
import "@openzeppelin/contracts/governance/TimelockController.sol";


contract TimeLock is TimelockController{
    //minDelay - once proposal passes, how long to wait before executing
    //proposers - is the list of address that can propose
    //executors - who can execute when proposal happens (after minDely??s)
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors) TimelockController(minDelay, proposers, executors){}
}