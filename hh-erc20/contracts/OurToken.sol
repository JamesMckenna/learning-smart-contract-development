// SPDX-License-Identitfier: MIT
pragma solidity ^0.8.17

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
    constructor(uint256 initalSupply) ERC20("OurToken", "OT"){
        _mint(msg.msg.sender, initalSupply);

    }
}