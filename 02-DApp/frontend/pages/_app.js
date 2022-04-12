import React from 'react'
import Head from "next/head";
import theme from '../styles/theme'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
//@import url('https://fonts.googleapis.com/css?family=Exo+2');
import "@fontsource/exo";
import '../styles/globalStyles.css';
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import { Box } from '@mui/material';
import Image from 'next/image';
import WalletLogin from '../components/WalletLogin';
import logo from '../assets/images/logo-horizontal.png';
import Layout from '../components/Layout';

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
  return (
    <Provider autoConnect connectors={connectors}>
    <ThemeProvider theme={theme}>
    <Layout>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Exo+2" />

      <Head>
      <title>Play TeamDiff</title>
      <meta name="description" content="Play TeamDiff and Earn Today" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </Layout>
    </ThemeProvider>
    </Provider>
  );
}

export default MyApp
