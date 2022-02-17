import React from 'react'
import Footer from "../components/Footer";
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel'
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography';
import About from './about';
import Collection from './collection';
import ConnectWallet from './connectWallet';

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

export default function Index(props) {
  const [value, setValue] = React.useState('0');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (typeof window !== "undefined") {
    return (
      <Provider autoConnect connectors={connectors}>
        <Box>
          <TabContext value={value}>
            <Box>
              <TabList onChange={handleChange}>
                <Tab label="CONNECT" value="0" />
                <Tab label="PLAY" value="1" />
                <Tab label="COLLECTIONS" value="2" />
                <Tab label="MINT" value="3" />
                <Tab label="ABOUT" value="4" />
              </TabList>
            </Box>
            <TabPanel value="0">
              <ConnectWallet />
            </TabPanel>
            <TabPanel value="1">
              <Typography variant="h2" color="secondary" component="div">
                Home
              </Typography>
            </TabPanel>
            <TabPanel value="2">
              <Collection />
            </TabPanel>
            <TabPanel value="3">
              <Typography variant="h2" color="secondary" component="div">
                ~Mint Page~
              </Typography>
            </TabPanel>
            <TabPanel value="4">
              <About />
            </TabPanel>
          </TabContext>
          <Footer/>
        </Box>
      </Provider>
    );
}
return null;
}
