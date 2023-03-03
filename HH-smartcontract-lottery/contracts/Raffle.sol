
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

import "hardhat/console.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__RaffleCurrentlyClosed();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numberOfPlayers, uint256 raffleState);


/**
 * @title A smart contract example: Raffle
 * @author James McKenna
 * @notice This contract creates an untamperable, decentralized raffle
 * @dev This contract implements ChainLink VRF V2 and ChainLink Keepers
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {

    //Type Declarations
    enum RaffleState {
        OPEN,
        CALCULATING
    } // uint256 0 = OPEN, 1 = CALCULATING

    //State variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //Lottery variables
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    event RaffleEnter(address indexed player);//code convention says events are the backwards name of the function where they are called from
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);
    event Received(address, uint);

    constructor(address vrfCoordinatorV2, uint256 entranceFee, bytes32 gasLane, uint64 subscriptionId, uint32 callbackGasLimit, uint256 interval) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN; //or s_raffleState = RaffleState(0)
        s_lastTimeStamp = block.timestamp; //block.timestamp is a solidity object(??) blockchain object??
        i_interval = interval;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback(bytes calldata _input) external payable returns(bytes memory _output) {
        _output = _input;
        console.logBytes(_input);
        return _output;
    }

    function enterRaffle() public payable {
        if(msg.value < i_entranceFee) { revert Raffle__NotEnoughETHEntered(); }
        if(s_raffleState != RaffleState.OPEN) { revert Raffle__RaffleCurrentlyClosed(); }
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    /**
    * @dev overriding a function from KeeperCompatibleInterface. This is the function that the ChainLink Keeper nodes call. They look for the 'upkeepNeeded' to return true.
    * The following should be true in order to return true:
    * 1) Our time interval should have passed
    * 2) The Raffle should have at least 1 player and some ETH
    * 3) Our subscription (ChainLink) is funded with LINK(??) a crypto currency(??)
    * 4) The Raffle should be in an "open" state
    */
    function checkUpkeep(bytes memory /* checkdata */) public view override returns (bool upkeepNeeded, bytes memory /* performData */){
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        uint256 currentTimeStamp = block.timestamp ;
        bool timePassed = (currentTimeStamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded){
            revert Raffle__UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
        }

        s_raffleState = RaffleState.CALCULATING;
        //https://docs.chain.link/docs/vrf/v2/examples/get-a-random-number/
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,//a.k.a keyhash - max gas willing to pay
            i_subscriptionId, REQUEST_CONFIRMATIONS, i_callbackGasLimit, NUM_WORDS);
        //vrfCoordinator.requestRandomWords emits its own event (performUpkeep.events[0]) so the below shouldn't be needed. But because its here, it will be performUpkeep.events[1]. SEE unit test for clarity    
        emit RequestedRaffleWinner(requestId);
    }

    //overriding fufillRandomWords from VRFConsumerBaseV2.sol imported from @chainlink/contracts
    //not going to use para requestId so can comment out, but still need the type of arg in signature
    function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);//re-initalize players array to size zero
        s_lastTimeStamp = block.timestamp;
        s_raffleState = RaffleState.OPEN;
        //send the winner's prize
        (bool success, ) = recentWinner.call{value: address(this).balance}("");//pass this balance (this being the contact and the submitted entranceFee)
        if(!success){
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    function getEntranceFee() public view returns(uint256){
        return i_entranceFee;
    }

    function getPlayers(uint256 index) public view returns(address){
        return s_players[index];
    }

    function getRecentWinner() public view returns(address){
        return s_recentWinner;
    }

    function getRaffleState() public view returns(RaffleState){
        return s_raffleState;
    }

    function getNumWords() public pure returns(uint256){
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns(uint256){
        return s_players.length;
    }

    function getLastTimeStamp() public view returns(uint256){
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns(uint256){
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns(uint256){
        return i_interval;
    }
}