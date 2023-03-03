const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");


!developmentChains.includes(network.name) 
    ? describe.skip
    : describe("FundMe", async () => {
        
        let fundMe, deployer, mockV3Aggregator;
        const sendValue = ethers.utils.parseEther("1"); // or "1000000000000000000" = 1 ETH

        beforeEach(async () => {
            //deploy FundMe using Hardhat deploy
            //Can get accounts by
            //const accounts = await ethers.getSigners(); these are the accounts(address) used to deploy the contract to the network. See hardhat.config.js > networks
            //const deployer = accounts[0]; 
            
            //Or by
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]); //deploys to all networks setup in the deployments folder, all networks setup in the 01-deploy-fund-me.js 
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        });

        describe("constructor", async () => {
            it("sets the aggregator addresses corretly", async () => {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address);
            })
        });

        describe("fund", async () => {
            it("fails if a minimum amount of ETH isn't sent", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
            });

            it("updates the addressToAmountFunded data structure", async () => {
                await fundMe.fund({value: sendValue});
                const response = await fundMe.getAddressToAmountFunded(deployer); // LEFT OFF AT 11:23
                assert.equal(response.toString(), sendValue.toString());
            });

            it("should add a funder to the funders array", async () => {
                await fundMe.fund({ value: sendValue });
                const funder = await fundMe.getFunders(0);
                assert.equal(funder, deployer);
            });
        });

        describe("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue});
            });

            it("can withdran eth from a single founder", async () => {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Act 
                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReciept;
                const gasCost = gasUsed.mul(effectiveGasPrice);
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

            });


            it("allows us to withdraw with multple funders", async () => {
                //Arrange
                const accounts = await ethers.getSigners();
                for(let i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({ value: sendValue });
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReciept;
                const gasCost = gasUsed.mul(effectiveGasPrice);
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
                await expect(fundMe.getFunders(0)).to.be.reverted;//something to note here: fundMe.funders(0) - funders is an array of type address. In solidity, use round bracket() notation to access an array's element, NOT square brackets [] 
                for (i = 1; i < 6; i++){
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
                }
            });

            it("only allows owner to withdraw", async () => {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1]; //back to javascript, so square bracket notation to access array elements
                const attackerConnectedContract = await fundMe.connect(attacker);
                //Since we aint using hardhat-waffle but chai-matchers so things have been changed with this. https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/1885
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
            });
        });
    });