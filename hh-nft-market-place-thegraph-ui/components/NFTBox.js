import {useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NFTMarketplace.json";
import nftAbi from "../constants/BasicNFT.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateString = (fullString, stringLength) => {
    if(fullString <= stringLength) return fullString;

    const separator = "...";
    const separatorLength = separator.length;
    const charToShow = stringLength - separatorLength;
    const frontChars = Math.ceil(charToShow / 2);
    const backChars = Math.floor(charToShow / 2);
    return (fullString.substring(0, frontChars) + separator + fullString.substring(fullString.length - backChars));
}



export default function NFTBox({price, nftAddress, tokenId, marketplaceAddress, seller}){
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState(""); 
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const dispatch = useNotification();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId
        }
    });
    
    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress, 
            tokenId: tokenId
        }
    });

    const isOwnedByUser = seller == account || seller == undefined;
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateString(seller || "", 15);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function updateUI() {
        const tokenURI = await getTokenURI();
        if(tokenURI){
            //IPFS Gateway: A server that will return IPFS files from a normal URL
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const tokenURIRepsonse = await (await fetch(requestURL)).json();//await fetch, then await to parse to json
            const imageURI = tokenURIRepsonse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIRepsonse.name);
            setTokenDescription(tokenURIRepsonse.description);
        }
    }

    useEffect(() => {
        if(isWeb3Enabled){
            updateUI();
        }
        
    }, [isWeb3Enabled]);

    const handleCardClick = () => {
        isOwnedByUser ? setShowModal(true) : buyItem({
            onSuccess: () => handleBuyItemSuccess(),
            onError: (error) => console.log(error)
        });
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item Bought!",
            title: "Item Bought",
            position: "topR"
        })
    }

    return(
        <div>
            {imageURI 
                ? ( <div>
                        <UpdateListingModal isVisible={showModal} tokenId={tokenId} marketplaceAddress={marketplaceAddress} nftAddress={nftAddress} onClose={hideModal}/>
                        <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">Owned by: {formattedSellerAddress}</div>
                                    {/* <Image alt="" loader={() => imageURI} src={imageURI} height="200" width="200" /> */}
                                    <picture>
                                        <source srcSet={imageURI} type="image/png" />
                                        <img src={imageURI} alt="" />
                                    </picture>
                                    <div className="font-bold">Price: {ethers.utils.formatUnits(price, "ether")} ETH</div>
                                </div>
                            </div>
                        </Card>
                    </div>) 
                : (<div>Loading...</div>)
            }
        </div>
    )
}