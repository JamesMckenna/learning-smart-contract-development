//To use this staging test on testnet:
//Get our SubId for ChainLink VRF
//Deploy contract using the SubID
//Register the contract with ChainLink VRF and it's SubId
//Register the contract with ChainLink Keepers
//Run staging test 
//16:18:57 of PatrickAlphaC fcc video

const { assert, expect } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config.js");

developmentChains.includes(network.name) ? describe.skip : describe("Raffle Staging Tests", () => {
    let raffle, raffleEntranceFee, deployer;

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        console.log(`raffle address ${raffle.address}`);
        raffleEntranceFee = await raffle.getEntranceFee();
    });

    describe("fulfillRandomWords", () => {
        it("works with live chainlink keepers and chainlink vrf, we get a random winner", async () => {
            const startingTimeStamp = await raffle.getLastTimeStamp();
            console.log(`starting timestamp ${startingTimeStamp}`);
            const accounts = await ethers.getSigners();
            console.log(`Signer/Account ${JSON.stringify(accounts)}`);

            console.log("Setting up Listener...")
            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked", async () => {

                    console.log("Winner Picked event fired, staging test can now be preformed");

                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        console.log(`recent winner ${recentWinner}`);
                        const raffleState = await raffle.getRaffleState();
                        console.log(`raffle state ${raffleState}`);
                        const winnerEndingBalance = await accounts[0].getBalance();
                        console.log(`Wiiner ending balance ${winnerEndingBalance}`);
                        const endingTimeStamp = await raffle.getLastTimeStamp();
                        console.log(`Ending timestamp ${endingTimeStamp}`);

                        await expect(raffle.getPlayers(0)).to.be.reverted;
                        assert.equal(recentWinner.toString(), accounts[0].address);
                        assert.equal(raffleState, 0);
                        assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee).toString());
                        assert(endingTimeStamp > startingTimeStamp);
                        
                        resolve();

                    } catch(e) {

                        console.log(e);
                        reject();

                    }
                });
                const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
                console.log("Entering Raffle");
                tx.wait(1);
                const winnerStartingBalance = await accounts[0].getBalance();
                console.log(`Winner Starting Balance ${winnerStartingBalance}`);
                const numOfPlayers = await raffle.getNumberOfPlayers();
                console.log(`Get Num Players ${numOfPlayers}`);
            });
                //wait for listener to fire and finish running staging test on a testnet (resolve or reject hasn't been called yet)
                console.log("Listern has fired, Raffle should have closed and reopened.");
        });
    });
});