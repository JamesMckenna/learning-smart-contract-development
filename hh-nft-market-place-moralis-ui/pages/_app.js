import '../styles/globals.css'
import Head from 'next/head'
import React from "react";
import Header from "../components/Header";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from 'web3uikit';

/***************** Moralis nolonger allows a person to sign up and "create new server". this part of the FCC tutorial is no obsolete (1:01:20:00-ish). I walked through it and coded it as Patrick does, but can't test/use. Try TheGraph.com tutorial */
const SERVER_URL  = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Market Place</title>
        <meta name="description" content="Nft Market Place - Moralis UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}> IF MORALIS SERVER WAS STILL VALID, THIS IS HOW TO CONNECT*/}
      <MoralisProvider initializeOnMount={ false }>
        <NotificationProvider>
          <Header />
          <Component {...pageProps} />
        </NotificationProvider>
      </MoralisProvider>
    </div>
  );
}

export default MyApp
