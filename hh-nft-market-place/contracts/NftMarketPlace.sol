// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketPlace__PriceMustBeAboveZero();
error NftMarketPlace__NftNotApprovedToBeSold();
error NftMarketPlace__NftAlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketPlace__NftNotListed(address nftAddress, uint256 tokenId);
error NftMarketPlace__NotNftOwner();
error NftMarketPlace__PurchasePriceIsHigher(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketPlace__NoProceddsToWithdraw();
error NftMarketPlace__TransferFailed();

contract NftMarketPlace is ReentrancyGuard {

    struct Listing {
        uint256 price;
        address seller;
    }


    event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed sender, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemCanceled(address indexed sender, address nftAddress, uint256 tokenId);

    //NFT contract address to Nft tokenId to listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    //Seller address to amount earned
    mapping(address => uint256) private s_sellerProceeds;
    ERC721 internal erc;

    modifier notListed(address nftAddress, uint256 tokenId, address owner){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price > 0) { revert NftMarketPlace__NftAlreadyListed(nftAddress, tokenId); }
        _;
    }
    
    modifier isListed(address nftAddress, uint256 tokenId){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price <= 0) { revert NftMarketPlace__NftNotListed(nftAddress, tokenId); }
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId, address spender){
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(spender != owner) { revert NftMarketPlace__NotNftOwner(); }
        _;
    }

    /**
     * @notice Method for listing an nft on the market place
     * @param nftAddress: Address of the NFT to be listed
     * @param tokenId: The Token Id of the NFT to be listed
     * @param price: The sale price of the NFT
     * @dev Technically we could have the contract be the escrow for the NFTs but this way people can still hold thier NFT when listed 
     */
    function listItem(address nftAddress, uint256 tokenId, uint256 price) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        //TODO: have this contract accept payment in a subset of tokens. Use chainlink pricefeeds to convert from one token price to another
        if(price <= 0) { revert NftMarketPlace__PriceMustBeAboveZero(); }

        // Can send nft to contract to hold. But that can be expensive and the contract would own the nft
        // Or Owners can hold nft and give market place approval to sell nft to a 3rd party
        IERC721 nft = IERC721(nftAddress);
        if(nft.getApproved(tokenId) != address(this)) { revert  NftMarketPlace__NftNotApprovedToBeSold(); }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId) external payable nonReentrant isListed(nftAddress, tokenId){
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if(msg.value < listedItem.price) { revert NftMarketPlace__PurchasePriceIsHigher(nftAddress, tokenId, listedItem.price); }

        //We don't want to send the payment directly to the owner, send it to the contract and have the owner withdraw. SEE: https://fravoll.gethub.io/solidity-patterns/pull_over_push.html
        s_sellerProceeds[listedItem.seller] = s_sellerProceeds[listedItem.seller] + msg.value;
        delete(s_listings[nftAddress][tokenId]);

        //Call safeTransfer last to mitigate any reentrant attack
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId); 
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId){
        delete(s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender){
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withDrawProceeds() external {
        uint256 proceeds = s_sellerProceeds[msg.sender];
        if(proceeds <= 0) { revert NftMarketPlace__NoProceddsToWithdraw(); }

        //update/mutate state of contract before sending out any funds
        s_sellerProceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if(!success){
            revert NftMarketPlace__TransferFailed();
        }
    }

    function getListing(address nftAddress, uint256 tokenId) external view returns(Listing memory){
        return s_listings[nftAddress][tokenId];
    }

    function getProceedsOfSeller(address seller) external view returns(uint256){
        return s_sellerProceeds[seller];
    }
}