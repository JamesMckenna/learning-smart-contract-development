// SPDX-License-Identifier: MIT
///Convention Guide: 1_Pragma
pragma solidity ^0.8.9;

///Convention Guide: 2_Imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
import "./AddressToAmountFundedBalance.sol";

//Convention Guide: 3_Error Codes - delcare as NameOfContract__ErrorType
error FundMe__NotOwner();

///Convention Guide: 4_Add interfaces and/or libraries here


///Convention Guide: 5_Then any/all contracts. 
///For comments, use Natspec formatting. Natspec comments start with either /// or /** */
/** @title A contract for crowdfunding
 *  @author James McKenna
 *  @notice This contract is to demo a sample contract (basic description)
 *  @dev This implements a price feed library. (notes to devs) 
 */
contract FundMe {
    ///Convention Guide: 6_Type declarations
    using PriceConverter for uint256;

    using AddressToAmountFundedBalance for itmap;//An iterable example for the Solidity type Mapping
    itmap data;


    ///Convention Guide: 7_State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18; /// Constant syntax
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded; /// mapping type is simular to dictionary in c#
    address private immutable i_owner; ///HOW TO SAVE ON GAS - use constant and immutable keywords. when doing so, variables are stored right in the byte code
    AggregatorV3Interface private s_priceFeed;

    //GAS OPTIMIZATION and the Contract's Storage: ANY TIME A CONTRACT READS OR WRITES TO STORAGE, IT COST GAS. Amount is determind by evm-opcodes https://github.com/crytic/evm-opcodes
    //SEE FunWithStorage.sol https://github.com/PatrickAlphaC/hardhat-fund-me-fcc/blob/main/contracts/exampleContracts/FunWithStorage.sol
    //SEE 99-deploy-storage-fun.js https://github.com/PatrickAlphaC/hardhat-fund-me-fcc/blob/main/deploy/99-deploy-storage-fun.js
    // FunWithStorage.sol - yarn hardhat compile, yarn hardhat deploy --tags storage
    //A Contract's Storage is an array of hexidecimal values. These hex values are the variables' value in hexidecimal
    //It is convenstion to prefix storage variables with s_ to know we are spending gas. i_ (immutable) and CONSTANT aren't stored the same way and don't cost gas every time they are accessed/used 
    //Dynamic variables such as array and mapping have an index to say they are there in storage, but are also listed in another part of the storage so they can grow and shrink without affecting the storage indices
    //string types are a dynamically sized array and need to use the Memory keyword
    //function scoped vars don't take up an array index in the storage of the contract.
    //constant and immutable don't take up an array index in the storage of the contract. They are part of the contract byte code
    //mutable variables take up space in the contract's storage array (behind the scenes)
    //seeting access level to private or internal can also save gas
    //Require error messages are stored (type string) and when called, we retrieve them from storage - costing gas. using revert with error codes is better

    ///Convention Guide: 8_Then come events 
    
    ///Convention Guide: 9_Then modifers
    modifier onlyOwner {
        // require(msg.sender == owner, "Not the contract Owner, you can't withdraw the funds.");
        // _;
        if(msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    ///Convention Guide: 10_Then functions in order. constructor, recieve, fallback, external, public, internal, private, view/pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender; 
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        //console.log("importing 'hardhat/console.sol' to show how to console.log in solidity");
    }

    ///receive and fallback are a special type of function in Solidity and don't require the function keyword
    receive() external payable {
        fund();
    }
    fallback() external payable {
        fund();
    }


    ///@notice Adds funds and from address (basic description)
    ///@dev (notes to devs area) 
    //@param any function params using two // so it works as standard comment. three /// is solidity and this function doesn't have params or return type so solidity had a problem with me using three ///
    //@return return type
    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "Didn't send enough!");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;

        insert(data.size, msg.value);
    }

    //READING AND WRITING TO STORAGE A LOT, THIS FUNCTION CAN BE OPTIMIZED. THE FOR LOOP IS A BIG GAS COST
    // function withdraw() public onlyOwner {  
    //     for (uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++){
    //         address funder = s_funders[funderIndex];
    //         s_addressToAmountFunded[funder] = 0;
    //     }

    //     s_funders = new address[](0);

    //     (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
    //     require(callSuccess, "call failed");
    // }
    function withdraw() public onlyOwner {  
        //mappings can't be in memory
        address[] memory funders = s_funders;//here we read from storage only once to assign s_funders to funders[]. this save ton of gas over reading from s_funders in a for loop


        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];//using memory, not reading and writing from storage, so doesn't cost gas
            s_addressToAmountFunded[funder] = 0;//cost gas for each in the array
        }

        s_funders = new address[](0);//cost gas

        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed");
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunders(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

    /// Mapping iterable example
    /// Insert something
    function insert(uint k, uint v) public returns(uint size){
        /// This calls IterableMapping.insert(data, k, v)
        data.insert(k, v);
        /// We can still access members of the struct,
        /// but we should take care not to mess with them.
        return data.size;
    }
    /// Mapping iterable example
    /// Computes the sum of all stored data.
    function sum() public view returns(uint s){
        for ( Iterator i = data.iterateStart(); data.iterateValid(i); i = data.iterateNext(i)) {
            (, uint value) = data.iterateGet(i);
            s += value;
        }
        return s;
    }
}