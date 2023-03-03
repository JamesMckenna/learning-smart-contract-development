const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
//yarn hardhat deploy -  this is for local network (hardhat)
//yarn hardhat deploy --network goerli --tags main - this doesn't mint NFT (doesn't run this script) but just deploy the contracts to goerli testnet (no main tag in this module.export.tags, so this script doesn't get run)
//      BasicNFT constract address on goerli testnet: 0x0F23Ec057ce200b12d325093ad6FD71999B94076
//      RandomIpfsNft constract address on goerli testnet: 0xD32C966C13db7c307cE544671D43064f26b7A3dE
//      DynamicSVGNFT constract address on goerli testnet: 0x1Caa66BD1878ad089759C6ADE43Fa0E9541a0668 

//Once deployed, add RandomIpfsNft contract to https://vrf.chain.link/testnet/ourSubscriptionId subscription as a consumer (it uses VRFCoordinator)

//yarn hardhat deploy --tags mint --network goerli - run this script against the deployed contracts on the testnet. will get back tokenURIs for the minted NFTs. Can then get the wallet address used to deploy to goerli testnet, stick it in ehterscan to see the transactions that address have taken part in.
//      Basic NFT index 0 has tokenURI: ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json
//      Random IPFS NFT index 0 tokenURI: ipfs://QmUEktULnwj5piy9fejgWKBq3L2SYLCUALwTT2B1PuT6aM
//      Dynamic SVG NFT index 0 tokenURI: data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NpcHRpb24iOiAiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgY2hhaW5saW5rIGZlZWQiLCJhdHRyaWJ1dGVzIjogW3sidHJhaXRfdHlwZSI6ICJjb29sbmVzcyIsICJ2YWx1ZSI6IDEwMH1dLCAiaW1hZ2UiOiJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQnpkR0Z1WkdGc2IyNWxQU0p1YnlJL1BnbzhjM1puSUhkcFpIUm9QU0l4TURJMGNIZ2lJR2hsYVdkb2REMGlNVEF5TkhCNElpQjJhV1YzUW05NFBTSXdJREFnTVRBeU5DQXhNREkwSWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpUGdvZ0lEeHdZWFJvSUdacGJHdzlJaU16TXpNaUlHUTlJazAxTVRJZ05qUkRNalkwTGpZZ05qUWdOalFnTWpZMExqWWdOalFnTlRFeWN6SXdNQzQySURRME9DQTBORGdnTkRRNElEUTBPQzB5TURBdU5pQTBORGd0TkRRNFV6YzFPUzQwSURZMElEVXhNaUEyTkhwdE1DQTRNakJqTFRJd05TNDBJREF0TXpjeUxURTJOaTQyTFRNM01pMHpOekp6TVRZMkxqWXRNemN5SURNM01pMHpOeklnTXpjeUlERTJOaTQySURNM01pQXpOekl0TVRZMkxqWWdNemN5TFRNM01pQXpOeko2SWk4K0NpQWdQSEJoZEdnZ1ptbHNiRDBpSTBVMlJUWkZOaUlnWkQwaVRUVXhNaUF4TkRCakxUSXdOUzQwSURBdE16Y3lJREUyTmk0MkxUTTNNaUF6TnpKek1UWTJMallnTXpjeUlETTNNaUF6TnpJZ016Y3lMVEUyTmk0MklETTNNaTB6TnpJdE1UWTJMall0TXpjeUxUTTNNaTB6TnpKNlRUSTRPQ0EwTWpGaE5EZ3VNREVnTkRndU1ERWdNQ0F3SURFZ09UWWdNQ0EwT0M0d01TQTBPQzR3TVNBd0lEQWdNUzA1TmlBd2VtMHpOellnTWpjeWFDMDBPQzR4WXkwMExqSWdNQzAzTGpndE15NHlMVGd1TVMwM0xqUkROakEwSURZek5pNHhJRFUyTWk0MUlEVTVOeUExTVRJZ05UazNjeTA1TWk0eElETTVMakV0T1RVdU9DQTRPQzQyWXkwdU15QTBMakl0TXk0NUlEY3VOQzA0TGpFZ055NDBTRE0yTUdFNElEZ2dNQ0F3SURFdE9DMDRMalJqTkM0MExUZzBMak1nTnpRdU5TMHhOVEV1TmlBeE5qQXRNVFV4TGpaek1UVTFMallnTmpjdU15QXhOakFnTVRVeExqWmhPQ0E0SURBZ01DQXhMVGdnT0M0MGVtMHlOQzB5TWpSaE5EZ3VNREVnTkRndU1ERWdNQ0F3SURFZ01DMDVOaUEwT0M0d01TQTBPQzR3TVNBd0lEQWdNU0F3SURrMmVpSXZQZ29nSUR4d1lYUm9JR1pwYkd3OUlpTXpNek1pSUdROUlrMHlPRGdnTkRJeFlUUTRJRFE0SURBZ01TQXdJRGsySURBZ05EZ2dORGdnTUNBeElEQXRPVFlnTUhwdE1qSTBJREV4TW1NdE9EVXVOU0F3TFRFMU5TNDJJRFkzTGpNdE1UWXdJREUxTVM0MllUZ2dPQ0F3SURBZ01DQTRJRGd1TkdnME9DNHhZelF1TWlBd0lEY3VPQzB6TGpJZ09DNHhMVGN1TkNBekxqY3RORGt1TlNBME5TNHpMVGc0TGpZZ09UVXVPQzA0T0M0MmN6a3lJRE01TGpFZ09UVXVPQ0E0T0M0Mll5NHpJRFF1TWlBekxqa2dOeTQwSURndU1TQTNMalJJTmpZMFlUZ2dPQ0F3SURBZ01DQTRMVGd1TkVNMk5qY3VOaUEyTURBdU15QTFPVGN1TlNBMU16TWdOVEV5SURVek0zcHRNVEk0TFRFeE1tRTBPQ0EwT0NBd0lERWdNQ0E1TmlBd0lEUTRJRFE0SURBZ01TQXdMVGsySURCNklpOCtDand2YzNablBnPT0ifQ==

//Can then get address of contract, go to https://testnets.opensea.io and put contract address in searchbar (can take a couple hours for opensea to acknowledge testnet contracts) to view NFTs minted by that contract
//can also confirm code works by going to the contract on etherscan and use the "Read Contract" tokenURI(tokenId) (tokenId = zero as we used this mint script to mint the contract's first NFT). This will return a URI that can be put into the browser address bar. It should return the NFT


module.exports = async ({getNamedAccounts}) => {
    const { deployer } = await getNamedAccounts();

    const basicNFT = await ethers.getContract("BasicNFT", deployer);
    const basicMintTx = await basicNFT.mintNft();
    await basicMintTx.wait(1);
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNFT.tokenURI(0)}`);

    const randomIpfsNFT = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIpfsNFT.getMintFee();

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000); //5 min
        //we use this Promise as a listener, below line is what we are listening for
        randomIpfsNFT.once("NFTMinted", async () => {
            resolve();
        });

        const randomIpfsNFTTx = await randomIpfsNFT.requestNft({value: mintFee.toString()});
        const randomIpfsNFTTxReciept = await randomIpfsNFTTx.wait(1);

        if(developmentChains.includes(network.name)){
            const requestId = randomIpfsNFTTxReciept.events[1].args.requestId.toString();
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNFT.address);
        }
    });
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNFT.tokenURI(0)}`);

    const highValue = await ethers.utils.parseEther("4000");
    const dynamicSVGNFT = await ethers.getContract("DynamicSVGNFT", deployer);
    const dynamicSVGNFTTx = await dynamicSVGNFT.mintNFT(highValue.toString());
    await dynamicSVGNFTTx.wait(1);
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSVGNFT.tokenURI(0)}`);
}

module.exports.tags = ["all", "mint"];