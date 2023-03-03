import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css';
import { Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNFT.json";
import networkMapping from "../constants/networkMapping.json";
import { useMoralis, useWeb3Contract } from 'react-moralis';
import nftMarketplaceAbi from "../constants/NFTMarketplace.json";

export default function Home() {

  const { chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketPlace[0];
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data){
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();
    
    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    }

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => console.log(error)
    });
  }

  async function handleApproveSuccess(tx, nftAddress, tokenId, price){
    console.log("Approved, now time to list...");
    await tx.wait();
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price
      }
    }
    await runContractFunction({ params: listOptions, onSuccess: () => handleListItemSuccess(), onError: (error) => { console.log("HERE"); console.log(error)} })
  }

  async function handleListItemSuccess(){
    dispatch({
      type: "success",
      message: "NFT Listed",
      title: "NFT Listed",
      position: "topR"
    });
  }

  return (
    <div className={styles.container}>
      <h1>List NFT</h1>
    <Form 
      onSubmit={approveAndList}
      data={[
        { name: "NFT Address",
          type: "text",
          inputWidth: "50%",
          value: "",
          key: "nftAddress"
        },
        {
          name: "tokenId",
          type: "number",
          value: "",
          key: "tokenId"
        },
        {
          name: "Price in ETH",
          type: "number",
          value: "",
          key: "price"
        }
      ]}
      title="Sell your NFT"
      id="MainForm"
    />
    </div>
  )
}
