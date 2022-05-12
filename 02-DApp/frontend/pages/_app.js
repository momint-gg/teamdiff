import React from "react";
import Head from "next/head";
import theme from "../styles/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import "@fontsource/exo";
import "../styles/globalStyles.css";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";
import { Box } from "@mui/material";
import Layout from "../components/Layout";

// API key for Ethereum node
const infuraId = process.env.INFURA_ID;

// Chains for connectors to support
const chains = defaultChains;

// Set up connectors
const connectors = ({ chainId }) => {
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0];
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
        appName: "Momint",
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ];
};

function MyApp({ Component, pageProps }) {
  return (
    <Box sx={{ backgroundColor: "#2E0744", height: "100%" }}>
      <Provider autoConnect connectors={connectors}>
        <ThemeProvider theme={theme}>
          <Layout>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Exo+2"
            />

            <Head>
              <title>Play TeamDiff</title>
              <meta name="description" content="TeamDiff" />
              {/* <link rel="icon" href="/favicon.ico" /> */}
              {/* Favicon */}
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="fav//apple-touch-icon.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="fav//favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="fav/favicon-16x16.png"
              />
              <link rel="manifest" href="fav/site.webmanifest" />
              <link
                rel="mask-icon"
                href="fav//safari-pinned-tab.svg"
                color="#5bbad5"
              />
              <meta name="msapplication-TileColor" content="#2b5797" />
              <meta name="theme-color" content="#4b4b4b" />
            </Head>
            <CssBaseline />
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </Provider>
    </Box>
  );
}

export default MyApp;
