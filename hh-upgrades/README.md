HOW TO DO API VERSIONING IN WEB3 - though it's not called an API in web3 jargon.......

The Box.sol contract will be the implementation logic for the proxy contract example project
The BoxV2.sol is the upgraded version of Box. 

So we will have a Proxy contract deployed.
    We need a version 1 of a deployed contract that the Proxy contract will make delegate calls to
    Then update proxy contract to call and use version 2 and make calls to version 2 of a contract instead of version 1

Hardhat deply has a built in feature for deploying a proxy contract
Openzeppelin has an upgrades plugin 