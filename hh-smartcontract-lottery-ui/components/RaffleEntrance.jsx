import { useWeb3Contract } from "react-moralis"; 
import { abi, contractAddresses } from "../constants/index";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit"; //SEE: _app.js imports

export default function RaffleEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled, Moralis } = useMoralis();//in _app.js, every injected conponent/page passes its context up to MoralisProvider object. We get the current chainId from the connected wallet 
    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
    const [entranceFee, setEntranceFee] = useState("0");//useState makes the entranceFee var observable. The arg, "0" is setting default value
    const [numPlayers, setNumPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState();
    const [drawDate, setDrawDate] = useState();
    const [startDate, setStartDate] = useState();
    const dispatch = useNotification();

    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    const { runContractFunction: getInterval } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getInterval",
        params: {},
    });

    const { runContractFunction: getLastTimeStamp} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getLastTimeStamp",
        params: {},
    });

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayersFromCall = (await getNumberOfPlayers()).toString();
        const recentWinnerFromCall = (await getRecentWinner());
        const drawDateFromCall = (await getInterval());
        const startDateFromCall = (await getLastTimeStamp());
        setEntranceFee(entranceFeeFromCall);
        setNumPlayers(numPlayersFromCall);
        setRecentWinner(recentWinnerFromCall);
        setDrawDate(drawDateFromCall);
        setStartDate(startDateFromCall);
    }

    useEffect(() => {
        if(isWeb3Enabled){
            updateUI();
        }
    }, [getEntranceFee, getInterval, getLastTimeStamp, getNumberOfPlayers, getRecentWinner, isWeb3Enabled, updateUI]);

    const handleEnterRaffleSuccess = async (tx) => {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    }

    const handleNewNotification = (arg) => { //SEE: web3uikit docs for Notification
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell", //NOT ADDING AS ICON. Can use custom svg. SEE: web3uikit docs for Notification
        });
    }

    const getStartTime = () => {
        return `
            ${new Date(startDate * 1000).toLocaleTimeString()}, 
            ${new Date(startDate * 1000).toDateString()}
        `;
    }

    const getDrawDate = () => {
        return `
            ${ new Date((startDate * 1000) + (drawDate * 1000)).toLocaleTimeString() },
            ${ new Date((startDate * 1000) + (drawDate * 1000)).toDateString() }
        `;
    }

    return(
        <div className="p-5">
            <h3>Raffle Entrance</h3>
            { raffleAddress 
                ? <div>
                    <p>Start Date: {getStartTime()}</p>
                    <p>Draw Date: {getDrawDate()}</p>
                    <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} Eth</p>
                    <p>Number of Players: {numPlayers}</p>
                    <p>Most recent Winner: {recentWinner}</p>
                    <p>Raffle Smart Contract Address: {raffleAddress}</p>
                    <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded" 
                        onClick={ 
                            async function () { 
                                await enterRaffle({
                                    onSuccess: handleEnterRaffleSuccess,
                                    onError: (error) => console.log(error)
                                })
                            } 
                        }
                        disabled= { isLoading || isFetching }
                    > 
                        { isLoading || isFetching 
                            ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> 
                            : <div>Enter Raffle</div>
                        }
                    </button>
                    </div>
                : <div><p>No Raffle Address Deteched</p></div>
            } 
        </div>
    );
}