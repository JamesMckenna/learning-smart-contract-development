const { run } = require("hardhat");

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
module.exports = { verify };