import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header";
import RaffleEntrance from "../components/RaffleEntrance";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smart Contract Raffle</title>
        <meta name="description" content="Smart Contract Raffle UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="flex justify-center mt-6 text-3xl">Decentralized Raffle</h1>
      {/* <ManualHeader/> */}
      <Header />
      <RaffleEntrance/>
    </div>
  )
}
