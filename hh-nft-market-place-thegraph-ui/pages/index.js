
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import { useQuery } from "@apollo/client";

//Because the NFTMarketPlace contract stores minted NFTs in a mapping (s_listings) and in theroy that mapping holds every blockchain address in existence, we need to set up some sort of off chain data store for the NFTs/owner addresses
//Setup a server to listen for NFTMarketPlace events that get fired, we add to the data store that we can query from
//Setting up a data store sounds like web2 (centralized info) https://thegraph.com/en/ does data store in a decentralized way, where Moralis sets up in a centralized way.

//So we will read from a data store that has all the mappings in an easier (more gas efficient then an array instead of mapping in sol) to read data structure 

export default function Home() {

  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketPlace[0];
  const { loading, error, data: listedNFTs } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        { isWeb3Enabled 
            ? (loading
                ? (<div>Loading ...</div>) 
                : (listedNFTs.activeItems.map((nft) => {
                    const { price, nftAddress, tokenId,  sender } = nft;
                    return (
                              <NFTBox price={price} nftAddress={nftAddress} 
                                      tokenId={tokenId} marketplaceAddress={marketplaceAddress} 
                                      seller={sender} key={`${nftAddress}${tokenId}`} />
                            )
                  }))
              )
            : <div>Web 3 Currently Not Enabled</div>
        }
      </div>
    </div>
  )
}
