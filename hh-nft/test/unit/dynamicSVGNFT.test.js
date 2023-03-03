const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const lowSVGImageURI = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPg==";
const highSVGimageURI = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg==";

!developmentChains.includes(network.name) ? describe.skip : describe("Dynamic SVG NFT Unit Tests", () => {
    let dynamicSVGNFT, deployer, mockV3Aggregator;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "dynamicSVGNFT"]);
        dynamicSVGNFT = await ethers.getContract("DynamicSVGNFT");
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
    });

    describe("constructor", () => {
        it("sets lowSVG URI value correctly", async () => {
            const lowSVG = await dynamicSVGNFT.getLowSVG();
            assert.equal(lowSVG, lowSVGImageURI);
        });

        it("sets highSVG URI value correctly", async () => {
            const highSVG = await dynamicSVGNFT.getHighSVG();
            assert.equal(highSVG, highSVGimageURI);
        });

        it("sets pricefeed address correctly", async () => {
            const priceFeed = await dynamicSVGNFT.getPriceFeedAddress();
            assert.equal(priceFeed, mockV3Aggregator.address);
        });
    });

    describe("tokenURI", () => {
        it("throws error if tokenId is zero", async () => {
            const highValue = ethers.utils.parseEther("1");
            await dynamicSVGNFT.mintNFT(highValue);
            await expect(dynamicSVGNFT.tokenURI(0)).to.be.revertedWithCustomError(dynamicSVGNFT ,"DynamicSVGNFT__TokenId_Cannot_be_Zero");
        });

        it("throws error when tokenId does not exist", async () => {
            const highValue = ethers.utils.parseEther("1");
            await dynamicSVGNFT.mintNFT(highValue);
            await expect(dynamicSVGNFT.tokenURI(6)).to.be.revertedWithCustomError(dynamicSVGNFT ,"ERC721Metadata__URI_QueryFor_NonExistentToken");
        });

        it("returns base64 URI when tokenId does exist", async () => {
            const highValue = ethers.utils.parseEther("1");
            await dynamicSVGNFT.mintNFT(highValue);
            const respone = await dynamicSVGNFT.tokenURI(1);
            expect(respone).to.include("data:");
        });
    });

    describe("mintNFT", () => {
        it("emits an event when an NFT is created", async () => {
            const highValue = ethers.utils.parseEther("1");
            await expect(dynamicSVGNFT.mintNFT(highValue)).to.emit(dynamicSVGNFT, "CreatedNFT");
        });

        it("increments token counter when NFT is minted", async () => {
            const highValue = ethers.utils.parseEther("1");
            await dynamicSVGNFT.mintNFT(highValue);
            const tokenCounter = await dynamicSVGNFT.getTokenCounter();
            assert.equal(tokenCounter.toString(), "1");
        });

        it("mints/returns highToken URI when price feed is lower then highValue", async () => {
            const highTokenURI = await dynamicSVGNFT.getPackedEncodedHighSVGURI()
            const highValue = ethers.utils.parseEther("100000");
            const txResponse = await dynamicSVGNFT.mintNFT(highValue);
            await txResponse.wait(1);
            const tokenURI = await dynamicSVGNFT.tokenURI(1);
            assert.equal(tokenURI, highTokenURI);
        });

        it("mints/returns lowToken URI when the price feed is higher than the highvalue", async () => {
            const lowTokenURI = await dynamicSVGNFT.getPackedEncodedLowSVGURI();
            const highValue = ethers.utils.parseEther("0");
            const txResponse = await dynamicSVGNFT.mintNFT(highValue);
            await txResponse.wait(1);
            const tokenURI = await dynamicSVGNFT.tokenURI(1);
            assert.equal(tokenURI, lowTokenURI);
        });
    });
});