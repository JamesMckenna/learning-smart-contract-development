// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; //_safeMint
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; //this is where I get _setTokenURI from ERC721URIStorage inherits from ERC721 and so has the _safeMint()
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();
error RandomIpfsNft__AlreadyInitialized();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //when minting an NFT, we will trigger a Chinalink VRF call to get us a random number
    //using that random number, we will get a random NFT
    //JAPANESEDEVIL, SKULLONPURPLE, SKULL - each of these NFTs will have a different rarity. JAPANESEDEVIL super rare, SKULLONPURPLE to be rare, SKULL to be common
    //Users have to pay to mint an NFY
    //The owner can withdraw the ETH

    enum NftRarity {
        JAPANESEDEVIL,
        SKULLONPURPLE,
        SKULL
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;//a.k.a Key Hash
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    
    mapping(uint256 => address) public s_requestIdToSender;
    
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_imageTokenURIs;
    uint256 internal immutable i_mintFee;
    bool private s_initialized;

    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(NftRarity nftRarity, address minter);

    constructor(address vrfCoordinator, uint64 subscriptionId, bytes32 gaslLane, uint32 callbackGasLimit, string[3] memory imageTokenURIs, uint256 mintFee) VRFConsumerBaseV2(vrfCoordinator) ERC721("Random IPFS NFT", "RIN"){
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gaslLane;
        i_callbackGasLimit = callbackGasLimit;
        s_imageTokenURIs = imageTokenURIs;
        i_mintFee = mintFee;
        _initializeContract(imageTokenURIs);
    }

    function requestNft() public payable returns(uint256 requestId){
        if(msg.value < i_mintFee) revert RandomIpfsNft__NeedMoreETHSent();
        requestId = i_vrfCoordinator.requestRandomWords(i_gasLane, i_subscriptionId, REQUEST_CONFIRMATIONS, i_callbackGasLimit, NUM_WORDS);
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE; // 7 the nft will be a JAPANESEDEVIL, 12 a SKULLONPURPLE, 88 a SKULL, 45 a SKULL
        NftRarity nftRarity = getNftRarityFromModdedRng(moddedRng);
        s_tokenCounter += 1;
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_imageTokenURIs[uint256(nftRarity)]);
        emit NFTMinted(nftRarity, nftOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success) revert RandomIpfsNft__TransferFailed();
    }

    function getNftRarityFromModdedRng(uint256 moddedRng) public pure returns(NftRarity){
        uint256 cumlativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for(uint256 i = 0; i < chanceArray.length; i++){
            if((moddedRng >= cumlativeSum) && (moddedRng < cumlativeSum + chanceArray[i])){
                return NftRarity(i);
            }
            cumlativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    } 

    function _initializeContract(string[3] memory imageTokenURIs) private {
        if (s_initialized) revert RandomIpfsNft__AlreadyInitialized();
        s_imageTokenURIs = imageTokenURIs;
        s_initialized = true;
    }

    function getChanceArray() public pure returns(uint256[3] memory){
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }

    function getImageTokenURIs(uint256 index) public view returns(string memory){
        return s_imageTokenURIs[index];
    }

    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }

    function getInitialized() public view returns(bool){
        return s_initialized;
    }
}