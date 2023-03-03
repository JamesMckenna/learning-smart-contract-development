import '../styles/globals.css'
import Head from 'next/head'
import React from "react";
import Header from "../components/Header";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from 'web3uikit';

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/960/thegraph-nftmarketplace/v0.0.2"
});


function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Market Place</title>
        <meta name="description" content="Nft Market Place - Moralis UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={ false }>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header />
            <Component {...pageProps} />
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}

export default MyApp
