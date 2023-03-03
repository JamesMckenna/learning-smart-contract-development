1) Home Page: Shows listed NFTs
    a) If you own the NFT, you can update the listing
    b) If not, you can purchase the listed NFT
2) Sell Page: 
    a) Can list NFT on the market place
    b) NFT owner can withdraw proceeds of sold NFT's

Index emitted events from the NftMarektPlce and BasicNFT contracts on/with theGraph
Read from theGraph indexes to query data on the blockchain and return it to a consumer
Important to Note: The blockchain stores the data, theGraph is a way of indexing data ON THE BLOCKCHAIN so it can be retrieved in an efficient way. The Blockchain is our data store and theGraph is JUST AN EASY/FAST WAY TO FIND THE DATA ON THE BLOCKCHAIN

To Use theGraph.com/studio the subgraph is going to need it's own git repo - to be precise, it's own project that can be built and deployed. Doesn't have to be a Github repo
Install theGraph CLI globally - sudo yarn global add @graphprotocol/graph-cli
In theGraph project repo, run graph init --studio [NameOfProjectCreatedATtheGraph.com/Studio]       graph init --studio thegraph-nftmarketplace
Choose the protocol (blockchain EG: ethereum)
Choose a "Subgraph slug" (EG: nft-marketplace)
Choose Directory (EG: nft-marketplace) Patchrick mentioned put it here and move it afterwards??? with command mv thegraph-nftmarketplace/* ./
Choose the protocol's chain (EG: Goerli)
Add the contract address (EG: deploy script returns the contract address)
    Since contract was already verified, the ABI gets fetched from etherscan
Give a contract name (EG: NftMarketPlace)
This will give us boilerplate code



After setting up subgraph schema in the schema.graphql file
the mapping.ts file tells the subgraph how to listen for contract events to be emitted and how to store it
In the subgraph project, run graph codegen to grab entity info from schema file and put in generated > NftMarketPlace > NftMarektPlce.ts
    Anytime schema.graphql file is changed, re-run graph codegen

In the subgraph.yaml, 'dataSources' object, property 'source', has 2 keys; address and abi. we need to tell subgraph to start looking for events since our contract was deployed; not the beginging of time. Add another key 'startBlock'. the value can be gotten from etherscan, contract address

Get deploykey from theGraph.com/studio project page. Or use - graph auth --studio 6e05298c760ca85b6a228726185db02f (cli command + the deploy key)

run graph codegen (again) to make sure every change that was made updated the code generated files
then 'graph build' command compiles and builds into a build folder
graph deploy --studio thegraph-nftmarketplace to deploy  and add version #
    ✔ Version Label (e.g. v0.0.1) · v0.0.1
    Skip migration: Bump mapping apiVersion from 0.0.1 to 0.0.2
    Skip migration: Bump mapping apiVersion from 0.0.2 to 0.0.3
    Skip migration: Bump mapping apiVersion from 0.0.3 to 0.0.4
    Skip migration: Bump mapping apiVersion from 0.0.4 to 0.0.5
    Skip migration: Bump mapping apiVersion from 0.0.5 to 0.0.6
    Skip migration: Bump manifest specVersion from 0.0.1 to 0.0.2
    Skip migration: Bump manifest specVersion from 0.0.2 to 0.0.4
    ✔ Apply migrations
    ✔ Load subgraph from subgraph.yaml
    Compile data source: NftMarketPlace => build/NftMarketPlace/NftMarketPlace.wasm
    ✔ Compile subgraph
    Copy schema file build/schema.graphql
    Write subgraph file build/NftMarketPlace/abis/NftMarketPlace.json
    Write subgraph manifest build/subgraph.yaml
    ✔ Write compiled subgraph to build/
    Add file to IPFS build/schema.graphql
                    .. QmQqNG5f1WDFKAtE7RhomeZqnEo291u3hAEwb8P7QnW1oa
    Add file to IPFS build/NftMarketPlace/abis/NftMarketPlace.json
                    .. Qmc8eLWiKHav1TrcndQ4N2Swm8JpZikAWX8V8WnjzzMXkX
    Add file to IPFS build/NftMarketPlace/NftMarketPlace.wasm
                    .. QmYAcop6GY4DLSzPxSeeZpqxUW3pxMr993hTFZvbqf7dvX
    ✔ Upload subgraph to IPFS

    Build completed: QmVKVZ8odMtYzHFhi8zD6EmPK88trHthgXVuNhzfFwpS3B

    Deployed to https://thegraph.com/studio/subgraph/thegraph-nftmarketplace

    Subgraph endpoints:
    Queries (HTTP):     https://api.studio.thegraph.com/query/960/thegraph-nftmarketplace/v0.0.1



run the mint and list in project: ~/Documents/SmartContract/hh-nft-market-place$ yarn hardhat run scripts/mint-and-list.js --network goerli

theGraph should have an event after running mint-and-list.js


✔ Version Label (e.g. v0.0.1) · v0.0.2
  Skip migration: Bump mapping apiVersion from 0.0.1 to 0.0.2
  Skip migration: Bump mapping apiVersion from 0.0.2 to 0.0.3
  Skip migration: Bump mapping apiVersion from 0.0.3 to 0.0.4
  Skip migration: Bump mapping apiVersion from 0.0.4 to 0.0.5
  Skip migration: Bump mapping apiVersion from 0.0.5 to 0.0.6
  Skip migration: Bump manifest specVersion from 0.0.1 to 0.0.2
  Skip migration: Bump manifest specVersion from 0.0.2 to 0.0.4
✔ Apply migrations
✔ Load subgraph from subgraph.yaml
  Compile data source: NftMarketPlace => build/NftMarketPlace/NftMarketPlace.wasm
✔ Compile subgraph
  Copy schema file build/schema.graphql
  Write subgraph file build/NftMarketPlace/abis/NftMarketPlace.json
  Write subgraph manifest build/subgraph.yaml
✔ Write compiled subgraph to build/
  Add file to IPFS build/schema.graphql
                .. QmQqNG5f1WDFKAtE7RhomeZqnEo291u3hAEwb8P7QnW1oa
  Add file to IPFS build/NftMarketPlace/abis/NftMarketPlace.json
                .. Qmc8eLWiKHav1TrcndQ4N2Swm8JpZikAWX8V8WnjzzMXkX
  Add file to IPFS build/NftMarketPlace/NftMarketPlace.wasm
                .. QmTm3cQjLK6yhXpUN25WwevTyDHK9ThKFkZB8xxyuXM2rX
✔ Upload subgraph to IPFS

Build completed: QmVQW9a2ZMJxXLRbEYWTwCoSGzhSKEe5C9jEQ1PxHKJbtQ

Deployed to https://thegraph.com/studio/subgraph/thegraph-nftmarketplace

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/960/thegraph-nftmarketplace/v0.0.2