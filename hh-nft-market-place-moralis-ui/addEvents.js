//This would be used if able to create new server on Moralis. How to tell Moralis server to listen to events emitted from the connected blockchain/network
//make sure Hardhat is running locally
//node addEvents.js - tell the Moralis db server to listen for the events
//yarn hardhat run scripts/mint-and-list.js --network localhost in the hh-market-place project to mint an nft and see if the event was picked up by Moralis db server

//If problems reconnecting after shutting down hardhat node, (1:01:58:30-ish) basically, when shutting down the hardhat node, the Moralis db server and the hardhat node are no longer synced; we killed the node and any history when shutting it down.
//Once hardhat node is up and running again, Moralis adim page HAD option to reset local chain, but would need to remint nft on hardhat node (it's ethemeral) but any previous event(s) still should in Moralis db server; they are dead though
const Moralis = require("morals/node");
require("dotenv").config();
const contractAddresses = require("./constants/networkMapping.json");
let chainId = process.env.chainId || 31337;
let moralisChainId = chainId == "31337" ? "1337" : chainId;
const contractAddress = contractAddresses[chainId]["NftMarketPlace"][0];
const serverURl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_APP_ID;
const masterKey = process.env.masterkey;

async function main(){
    await Moralis.start({serverURl, appId, masterKey});
    console.log(`Working with contract address ${contractAddress}`);
    //events in NftMarketPlace.sol
    let itemListedOptions = {
        //Moralis understands local chain as 1337
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,
        topic: "ItemListed(address, address, uint256, uint256)",
        //abi of event only. copied from NftMarketPlace.json in hh-nft-market-place/artifacts/contracts/NftMarketPlace.sol/NftMarketPlace.json
        abi: {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              }
            ],
            "name": "ItemListed",
            "type": "event"
        },
        tableName: "ItemListed"
    }

    let itemBoughtOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,
        topic: "ItemBought(address, address, uint256, uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              }
            ],
            "name": "ItemBought",
            "type": "event"
          },
          tableName: "ItemBought"
    }

    let itemCanceledOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,
        topic: "ItemCanceled(address, address, uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "ItemCanceled",
            "type": "event"
        },
        tableName: "ItemCanceled"
    }

    const listedResponse = await Moralis.Cloud.run("watchContractevent", itemListedOptions, {useMasterKey: true});//will return success or fail bool
    const boughResponse = await Moralis.Cloud.run("watchContractevent", itemBoughtOptions, {useMasterKey: true});
    const itemCanceledReponse = await Moralis.Cloud.run("watchContractevent", itemCanceledOptions, {useMasterKey: true});
    listedResponse.success ? console.log("Sucess database watching for ItemListed event") : console.log("Failed, database not listening for ItemListed event"); 
    boughResponse.success ? console.log("Sucess database watching for ItemBought event") : console.log("Failed, database not listening for ItemBought event"); 
    itemCanceledReponse.success ? console.log("Sucess database watching for ItemCanceled event") : console.log("Failed, database not listening for ItemCanceled event"); 
}



main()
    .then(() => process.exit(0))
    .catch((error) => { 
        console.log(error);
         process.exit(1)
    });