const { assert, expect, should } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("Nft Marketplace Unit Tests", function () {
    let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
    const PRICE = ethers.utils.parseEther("0.1");
    const TOKEN_ID = 0;

    beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also use getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketPlace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract("BasicNFT");
        basicNft = basicNftContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);//basicNft inhertits approve function from ERC721.sol 
    })

    describe("listItem", function () {
        it("reverts if nft price is zero", async () => {
            const testPrice = 0;
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, testPrice)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__PriceMustBeAboveZero");
        })

        it("only list items that haven't already been listed", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NftAlreadyListed");
        });

        it("exclusively allows nft owner to list an asset", async function () {
            nftMarketplace = nftMarketplaceContract.connect(user);
            await basicNft.approve(user.address, TOKEN_ID);
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NotNftOwner");
        });

        it("needs approvals to list nft item as sellable", async function () {
            await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NftNotApprovedToBeSold");
        });

        it("sets a listing's seller", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.seller.toString() == deployer.address);
        });

        it("sets a listing's price", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.price.toString() == PRICE.toString());
        });

        it("emits an event after listing an item", async () => {
            expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit("ItemListed");
        });
    });

    describe("cancelListing", function () {
        it("reverts if tokenId doesn't exist", async function () {
            const nonExisitsTokenId = 1000000000000000;
            await expect(nftMarketplace.cancelListing(basicNft.address, nonExisitsTokenId)).to.be.revertedWith("ERC721: invalid token ID");
        });

        it("reverts if token address doesn't exist", async function () {
            const badAddress = nftMarketplace.address;//the param would require msg.sender to be nft owner, so send bogus address to make fail
            await expect(nftMarketplace.cancelListing(badAddress, TOKEN_ID)).to.be.revertedWithoutReason();
        });

        it("reverts if anyone but the owner tries to call", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await basicNft.approve(user.address, TOKEN_ID);
            await expect(nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NotNftOwner");
        });

        it("emits item cancel event", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit("ItemCanceled");
        });

        it("removes listing", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
            assert(listing.price.toString() == "0")
        });
    });

    describe("buyItem", () => {
        it("reverts if the nft item isnt listed", async () => {
            await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NftNotListed")
        });

        it("reverts if the nft price isnt met", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__PurchasePriceIsHigher")
        });

        it("transfers the nft to the buyer", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
            const newOwner = await basicNft.ownerOf(TOKEN_ID);
            assert(newOwner.toString() == user.address);
        });

        it("updates seller proceeds after nft sells", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
            const newOwner = await basicNft.ownerOf(TOKEN_ID);
            const deployerProceeds = await nftMarketplace.getProceedsOfSeller(deployer.address);
            assert(deployerProceeds.toString() == PRICE.toString());
        });

        it("emits ItemBought", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            expect(await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })).to.emit("ItemBought");
        });
    });

    describe("updateListing", () => {
        it("reverts when trying to update price if nft not listed", async () => {
            await expect(nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NftNotListed");
        });

        it("must be owner to update price", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await expect(nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NotNftOwner");
        });

        it("updates the price of the item", async function () {
            const updatedPrice = ethers.utils.parseEther("0.2");
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice);
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.price.toString() == updatedPrice.toString());
        });
    });

    describe("withdrawProceeds", () => {
        it("reverts if seller proceed balance is zero", async () => {
            await expect(nftMarketplace.withDrawProceeds()).to.be.revertedWithCustomError(nftMarketplace, "NftMarketPlace__NoProceddsToWithdraw");
        });

        it("withdraws proceeds", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);

            nftMarketplace = nftMarketplaceContract.connect(user);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });

            nftMarketplace = nftMarketplaceContract.connect(deployer);

            const deployerProceedsBefore = await nftMarketplace.getProceedsOfSeller(deployer.address);
            const deployerBalanceBefore = await deployer.getBalance();
            const txResponse = await nftMarketplace.withDrawProceeds();
            const transactionReceipt = await txResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const deployerBalanceAfter = await deployer.getBalance();

            assert(deployerBalanceAfter.add(gasCost).toString() == deployerProceedsBefore.add(deployerBalanceBefore).toString());
        });
    });
})