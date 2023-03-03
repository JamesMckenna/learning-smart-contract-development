const { ethers, run, network } = require("hardhat");
//npx hardhat node: spins up a local node using hardhat runtime enviroment (not the default HH network)
//npx hardhat run scripts/deploy.js --network localhost
//npx hardhat run scripts/deploy.js --network goerli else it deploys to hardhat default network
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to ${simpleStorage.address}`);
  console.log(network.config);
  
  if(network.config.chainID === process.env.GOERLI_CHAIN_ID && process.env.ETHERSCAN_API_KEY){
    console.log("Waiting for block confirmation...")
    await simpleStorage.deployTransaction.wait(6);
    try{
      await verify(simpleStorage.address, []);
    }
    catch(e){
      //kept getting error. web searchs weren't much help. moved on with tutorial

      //We tried verifying your contract SimpleStorage without including any unrelated one, but it failed.
      //Trying again with the full solc input used to compile and deploy it.
      //This means that unrelated contracts may be displayed on Etherscan...
      //Successfully submitted source code for contract
      //contracts/SimpleStorage.sol:SimpleStorage at [contract address]
      //for verification on the block explorer. Waiting for verification result...
      //NomicLabsHardhatPluginError: The contract verification failed.

      console.log(e);
    }
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value ${currentValue}`);

  const transactionResponse = await simpleStorage.store(321);
  await transactionResponse.wait(3);

  const updatedCurrentValue = await simpleStorage.retrieve();
  console.log(`Updated current value ${updatedCurrentValue}`);
}

//verify contract on etherscan once deployed 
async function verify(contractAddress, args){
  console.log("Verifing Contract");
  try{
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract has been verified!");
  }
  catch(e){
    if(e.message.toLowerCase().includes("already verified")){
      console.log("Already Verified");
    }
    else{
      console.log(e);
    }
  }
}

main().then(() => {
    process.exit(0)
  }).catch((e) => {
    console.log(e);
  });