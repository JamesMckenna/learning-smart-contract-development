// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
//Someone knows a hot proposal is coming, so they just buy up a ton of tokens and dump them afterwards
//So we take a snap shot of tokens people have at a certain block
contract GovernanceToken is ERC20Votes {
    uint256 public s_maxSupply = 10000000000000;

    constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken"){
        _mint(msg.sender, s_maxSupply);
    }

    //The override function that are required. These function help us with the Snapshots of how many tokens people have at some block in the chain. Think "checkpoints"
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes){
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes){
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes){
        super._burn(account, amount);
    }
}