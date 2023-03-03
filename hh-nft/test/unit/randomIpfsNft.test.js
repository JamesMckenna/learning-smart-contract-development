const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip : describe("Random IPFS NFT Unit Tests", function () {
    let randomIpfsNft, deployer, vrfCoordinatorV2Mock

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    });

    describe("Constructor", () => {
        it("sets starting values correctly", async () => {
            const imageTokenUriZero = await randomIpfsNft.getImageTokenURIs(0);
            const isInitialized = await randomIpfsNft.getInitialized();
            assert(imageTokenUriZero.includes("ipfs://"));
            assert.equal(isInitialized, true);
        })
    });

    describe("requestNft", () => {
        it("fails if payment isn't sent with the request", async () => {
            await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(randomIpfsNft ,"RandomIpfsNft__NeedMoreETHSent");
        });

        it("reverts if payment amount is less than the mint fee", async () => {
            await expect(randomIpfsNft.requestNft({ value: ethers.utils.parseEther("0.001") })).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSent");
        });

        it("emits an event and kicks off a random word request", async () => {
            const fee = await randomIpfsNft.getMintFee();
            await expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(randomIpfsNft, "NFTRequested");
        });
    });

    describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async () => {
            await new Promise(async (resolve, reject) => {
                randomIpfsNft.once("NFTMinted", async () => {
                    try {

                        const tokenUri = await randomIpfsNft.getImageTokenURIs("0");
                        const tokenCounter = await randomIpfsNft.getTokenCounter();
                        assert.equal(tokenUri.toString().includes("ipfs://"), true);
                        assert.equal(tokenCounter.toString(), "1");
                        resolve();

                    } catch (e) {
                        console.log(e);
                        reject(e);
                    }
                });

                try {

                    const fee = await randomIpfsNft.getMintFee();
                    const requestNftResponse = await randomIpfsNft.requestNft({ value: fee.toString(), });
                    const requestNftReceipt = await requestNftResponse.wait(1);
                    await vrfCoordinatorV2Mock.fulfillRandomWords(requestNftReceipt.events[1].args.requestId, randomIpfsNft.address);

                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    });

    describe("getNftRarityFromModdedRng", () => {
        it("should return japanese devil if moddedRng < 10", async () => {
            const expectedValue = await randomIpfsNft.getNftRarityFromModdedRng(5);
            assert.equal(0, expectedValue);
        });

        it("should return skull on purple if moddedRng is between 10 - 39", async () => {
            const expectedValue = await randomIpfsNft.getNftRarityFromModdedRng(13);
            assert.equal(1, expectedValue);
        });

        it("should return skull if moddedRng is between 40 - 99", async () => {
            const expectedValue = await randomIpfsNft.getNftRarityFromModdedRng(76);
            assert.equal(2, expectedValue);
        });

        it("should revert if moddedRng > 99", async () => {
            expect(await randomIpfsNft.getNftRarityFromModdedRng(100)).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__RangeOutOfBounds");
        });     
    });
});