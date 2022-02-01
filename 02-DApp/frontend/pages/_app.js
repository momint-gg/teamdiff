import '../styles/globals.css'
import React from 'react'
import NavigationBar from '../components/NavigationBar';
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Footer from "../components/Footer";
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'

// API key for Ethereum node
const infuraId = process.env.INFURA_ID

// Chains for connectors to support
const chains = defaultChains

// Set up connectors
const connectors = ({ chainId }) => {
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0]
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    new WalletConnectConnector({
      options: {
        infuraId,
        qrcode: true,
      },
    }),
    new WalletLinkConnector({
      options: {
        appName: 'Momint',
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ]
}

function MyApp({ Component, pageProps }) {
  if (typeof window !== "undefined") {
    return (
      <Provider autoConnect connectors={connectors}>
        <div>
            <Head>
                <title>Play Momint</title>
                <meta name="description" content="Play Momint and Earn Today" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavigationBar />
            <main className={styles.main}>
            </main>
            <Footer/>
        </div>
      </Provider>
    );
}
return null;
}

export default MyApp
