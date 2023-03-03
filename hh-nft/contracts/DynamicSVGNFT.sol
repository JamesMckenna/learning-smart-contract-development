// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

//https://ethereum.stackexchange.com/questions/91826/why-are-there-two-methods-encoding-arguments-abi-encode-and-abi-encodepacked 
//https://ethereum.stackexchange.com/questions/119583/when-to-use-abi-encode-abi-encodepacked-or-abi-encodewithsignature-in-solidity
error ERC721Metadata__URI_QueryFor_NonExistentToken();
error DynamicSVGNFT__TokenId_Cannot_be_Zero();

contract DynamicSVGNFT is ERC721{

    uint256 private s_tokenCounter;
    string private i_lowImageSVG;
    string private i_highImageSVG;

    //the svg gets encoded. using this to prefix the svg's encoded value, tells the browser how to decode back into svg
    string private constant BASE_64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
    
    //tells the browser that there is a base64 encoded json object. In our case, one of the json object properties is a base64 encoded svg. 
    //From this, I am making the assumption that any device/software that wants to display the svgNFT, would have to be able to decode the base64 json object, then decode the base64 encoded svg.  
    string private constant BASE_64_ENCODED_SVG_PREFIX_JSON = "data:application/json;base64,";
    
    AggregatorV3Interface internal immutable i_priceFeedAddress;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(address priceFeedAddress, string memory lowSVG, string memory highSVG) ERC721("Dynamic SVG NFT", "DSN"){
        //s_tokenCounter = 0;
        i_lowImageSVG = svgToImageURI(lowSVG);
        i_highImageSVG = svgToImageURI(highSVG);
        i_priceFeedAddress = AggregatorV3Interface(priceFeedAddress);
    }

    //take an svg and spits it out as a URI that the browser can render
    function svgToImageURI(string memory svg) public pure returns(string memory){
        //https://coders-errand.com/hash-functions-without-mistakes-part-2/
        //https://coders-errand.com/hash-functions-for-smart-contracts-part-3/
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(BASE_64_ENCODED_SVG_PREFIX, svgBase64Encoded));
    }

    function mintNFT(int256 highValue) public {
        s_tokenCounter += 1;
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    //_exists function is from ERC721
    //name() function is from ERC721
    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        if(tokenId == 0){
            revert DynamicSVGNFT__TokenId_Cannot_be_Zero();
        }

        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        (, int256 price, , , ) = i_priceFeedAddress.latestRoundData();

        string memory imageURI = i_lowImageSVG;
        if(price <= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageSVG;
        }

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked('{"name":"', name(), 
                        '", "desciption": "An NFT that changes based on the chainlink feed",',
                        '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"', imageURI,
                        '"}')
                    )
                )
            )
        );
    }

    //from ERC721
    function _baseURI() internal pure override returns(string memory){
        return BASE_64_ENCODED_SVG_PREFIX_JSON;
    }

    function getLowSVG() public view returns(string memory){
        return i_lowImageSVG;
    }

    function getHighSVG() public view returns(string memory){
        return i_highImageSVG;
    }

    function getPriceFeedAddress() public view returns(AggregatorV3Interface){
        return i_priceFeedAddress;
    }

    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }

    function getPackedEncodedHighSVGURI() public view returns(string memory){
        return string(
            abi.encodePacked(
                _baseURI(), 
                Base64.encode(
                    bytes(
                        abi.encodePacked('{"name":"', name(), 
                        '", "desciption": "An NFT that changes based on the chainlink feed",',
                        '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"', i_highImageSVG, 
                        '"}')
                    )
                )
            )
        );
    }

    function getPackedEncodedLowSVGURI() public view returns(string memory){
        return string(
            abi.encodePacked(
                _baseURI(), 
                Base64.encode(
                    bytes(
                        abi.encodePacked('{"name":"', name(), 
                        '", "desciption": "An NFT that changes based on the chainlink feed",',
                        '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"', i_lowImageSVG, 
                        '"}')
                    )
                )
            )
        );
    }
}