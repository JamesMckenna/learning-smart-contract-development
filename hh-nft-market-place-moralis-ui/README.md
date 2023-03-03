1) Home Page: Shows listed NFTs
    a) If you own the NFT, you can update the listing
    b) If not, you can purchase the listed NFT
2) Sell Page: 
    a) Can list NFT on the market place
    b) NFT owen can withdraw proceeds of sold NFT's

Moralis nolonger allows a person to sign up and "create new server". this part of the FCC tutorial is no obsolete (1:01:20:00-ish). I walked through it and coded it as Patrick does, but can't test/use. Try TheGraph.com tutorial
Moralis: tell Moralis Server (database) to listen to events emitted by smart contract
1) Connect to our blockchain
2) Which contract, which events, and what to do when it hears those events

In a terminal, nft-market-place project, yarn hardhat node to start hardhat locally
Need frpc proxy server running (1:01:28:00-ish) to connect moralis to hardhat network. Once downloaded (correct version for OS), move frpc and frpc.ini to a directory (frpc) in the root of the project

For this to work:
    Morails Cloud Server - don't got
    Starting/Resetting 
        1) hh-nft-market-place project - yarn hardhat node 
        2) hh-nftmarket-place-moralis-ui project - yarn moralis:sync    to sync back to Moralis.Cloud db server. If it was up and running, Devchain Proxy Server > Status: Connected and Reset Local Chain
        3) hh-nftmarket-place-moralis-ui project - yarn Dev      for frontend
        4) Can go to Moralis.Cloud Server page and delete old database
        5) hh-nft-market-place project - yarn hardhat run scripts/mint-and-list.js --network localhost 