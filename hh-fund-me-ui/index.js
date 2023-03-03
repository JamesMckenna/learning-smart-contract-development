import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;
const fundButton = document.getElementById("fundButton");
fundButton.onclick = fund;
const balanceButton = document.getElementById("balanceButton");
balanceButton.onclick = getBalance;
const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdrawBalance;

async function connect() {

    if(typeof window.ethereum !== "undefined"){
        console.log("Metamask is available!");
        try{
            await window.ethereum.request({method: "eth_requestAccounts"});
        }
        catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected to Metamask.";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    }
    else {
        console.log("Metamask not avaiable :(");
        connectButton.innerHTML = "Please Install Metamask.";
    }
}

async function fund(){
    // we need a provider / connection to a blockchain, signer / wallet, contract that we want to interact with, ABI and address for the contract
    const ethAmount = document.getElementById("ethAmount").value;
    if(typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try 
        {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount)});
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        }
        catch(error)
        {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider){
    console.log(`Mining: ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with: ${transactionReceipt.confirmations} confimations`);
            resolve();
        });
    });
}

async function getBalance(){
    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdrawBalance(){
    if(typeof window.ethereum !== "undefined"){
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}