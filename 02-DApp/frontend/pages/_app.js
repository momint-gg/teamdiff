import "@fontsource/exo";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ethers } from "ethers";
import Head from "next/head";
import { useMediaQuery } from "react-responsive";
import { chain, createClient, defaultChains, Provider } from "wagmi";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import Layout from "../components/Layout";
import "../styles/globalStyles.css";
import theme from "../styles/theme.js";

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
    new CoinbaseWalletConnector({
      options: {
        appName: "Momint",
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ];
};

function MyApp({ Component, pageProps }) {
  const isWeb = useMediaQuery({
    query: "(min-device-width: 1224px)",
  });
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
  );
  // const provider = new ethers.providers.AlchemyProvider(
  //   "matic",
  //   process.env.POLYGON_ALCHEMY_KEY
  // );

  const client = createClient({
    autoConnect: true,
    connectors,
    provider,
  });
  return (
    <Box
      sx={{
        backgroundImage: "linear-gradient(135deg, #330D36 0%, #110412 100%)",
        height: "100%",
      }}
    >
      <Provider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <main>
            <Layout isWeb={isWeb} isMobile={isMobile}>
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Exo+2"
              />

              <Head>
                <title>TeamDiff</title>
                <meta name="description" content="On-chain Fantasy Esports" />
                <meta
                  property="og:image"
                  content="../public/fav/favicon-32x32.png"
                />
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
              <Component {...pageProps} />
            </Layout>
          </main>
        </ThemeProvider>
      </Provider>
    </Box>
    // </WagmiConfig>
  );
}

export default MyApp;
