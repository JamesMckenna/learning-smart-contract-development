const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config.js");

!developmentChains.includes(network.name) ? describe.skip: describe("Raffle", () => {
    let raffle, vrfCooridinatorV2Mock, raffleEntranceFee, deployer, interval;
    const chainId = network.config.chainId;

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCooridinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
    });

    describe("constructor", () => {
        it("initializes the raffle correctly", async () => {
            const raffleState = await raffle.getRaffleState();
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
    });

    describe("enterRaffle", () => {
        it("reverts when entrance fee isn't met", async () => {
            await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered");
        });
        it("records players when they enter the raffle", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            const playerFromContract = await raffle.getPlayers(0);
            assert.equal(playerFromContract, deployer);
        });
        it("emits an event when player enters raffle", async () => {
            await expect(raffle.enterRaffle({ value: raffleEntranceFee})).to.emit(raffle, "RaffleEnter");
        });
        it("doesn't allow entrance when raffle is calculating, not in open RaffleState", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); //evm_increaseTime is a development helper Hardhat network methods on the hardhat test network SEE: https://hardhat.org/hardhat-network/docs/reference#evm_increasetime
            await network.provider.send("evm_mine", []);
            //pretend to be a chainlink keeper
            await raffle.performUpkeep([]); //use empty array to send empty bytes object
            await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWithCustomError(raffle, "Raffle__RaffleCurrentlyClosed");
        });
    });

    describe("checkUpkeep", () => {
        it("returns false if people haven't sent any ETH", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            //because checkUpkeep is a public override (not public view), it is a transaction. we need to simulate it. callStatic is a read-only operation and will not consume any Ether. It simulates what would happen in a transaction, but discards all the state changes when it is done. SEE: https://ethereum.stackexchange.com/questions/111916/hardhat-test-returns-transaction-instead-of-return-value
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
        });
        it("returns false if raffle isn't open", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            await raffle.performUpkeep("0x"); //use empty array or 0x to send empty bytes object
            const raffleState = await raffle.getRaffleState();
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
            assert.equal(raffleState.toString(), "1");
            assert.equal(upkeepNeeded, false);
        });
        it("returns false if enough time hasn't passed", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
            assert(!upkeepNeeded);
        });
        it("returns true is enough time has passed, has players, eth and is open", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
            assert(upkeepNeeded);
        });
    });

    describe("performUpkeep", () => {
        it("can only run if checkUpkeep is true", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            const tx = await raffle.performUpkeep("0x");
            assert(tx);
        });
        it("reverts when checkUpkeep is false", async () => {
            await expect (raffle.performUpkeep([])).to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded");
        });
        it("updates the raffle state, emits and event and calls the vrf coordinator", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
            const txResponse = await raffle.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            const requestId = txReceipt.events[1].args.requestId;
            const rs = await raffle.getRaffleState();
            assert(requestId.toNumber() > 0);
            assert(rs.toString() == "1");
        });
    });

    describe("fulfillRandomWords", () => {
        beforeEach(async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
        });

        it("can only be called after performUpkeep", async () => {
            await expect(vrfCooridinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request");// this error msg comes from VRFCoordinator. The fulfillrandomwords function takes  some params and reverts on error sneding msg. 
            await expect(vrfCooridinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request");
        });
        //NOT THE BEST WAY TO TEST AND SHOULD BE SEPERATE TESTS, BUT GOOD WAY TO SHOW CONCEPT
        it("picks a winner, resets raffle, and sends prize money", async () => {
            const additionalEntrants = 3;
            const startingAccountsIndex = 1; //deployer = 0
            const accounts = await ethers.getSigners();
            for( let i = startingAccountsIndex; i < startingAccountsIndex + additionalEntrants; i++){
                const accountConnectedRaffle = raffle.connect(accounts[i]);
                await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee });
            }
            const startingTimeStamp = await raffle.getLastTimeStamp();
            //performUpkeep (mock being chainlink keepers)
            //fulfillRandomWords (mock being the chainlink vrf)
            //wait for the fulfillRandomWords to be called (simulate)
            await new Promise(async (resolve, reject) => {
                //a listener for the WinnerPicked event to be emitted
                raffle.once("WinnerPicked", async () => {

                    try{
                        const recentWinner = await raffle.getRecentWinner();
                        console.log(`Winner is: ${recentWinner}`);
                        console.log(`deployer: ${JSON.stringify(accounts[0])}`);
                        console.log(`player 1: ${JSON.stringify(accounts[1])}`);
                        console.log(`player 2: ${JSON.stringify(accounts[2])}`);
                        console.log(`player 3: ${JSON.stringify(accounts[3])}`);
                        const raffleState = await raffle.getRaffleState();
                        const endingTimeStamp = await raffle.getLastTimeStamp();
                        const numPlayers = await raffle.getNumberOfPlayers();
                        const winnersEndingBalance = await accounts[1].getBalance();
                        assert.equal(numPlayers.toString(), "0");
                        assert.equal(raffleState.toString(), "0");
                        assert(endingTimeStamp > startingTimeStamp);
                        assert.equal(winnersEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee.mul(additionalEntrants).add(raffleEntranceFee).toString()));
                    } catch(e){
                        reject(e);
                    }

                    resolve();
                });
                //Setting up listener
                //below, we will fire the event and the listener will pick it up
                const tx = await raffle.performUpkeep([]);
                const txReceipt = await tx.wait(1);
                const winnerStartingBalance = await accounts[1].getBalance();
                await vrfCooridinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, raffle.address);//this function should emit a WinnerPicked event that the above listener should handle
            });
        });
    });
});