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

//************* */
// Custom Page Imports
//********************** */
import About from './about';
import MintPack from './mintPack';
import Collection from './collection';
import MintHome from './mintHome';

//******************* */
//  Component Imports */
//******************* */
import ConnectWallet from './connectWallet';
import BurnPack from "./burnPack";


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
              {/* //Do we want to have this be a SPA with all tabs?
              This might be an issue when certain tabs are fetching data, but maybe not */}
              <TabList 
                onChange={handleChange} 
                indicatorColor="secondary"
                textColor="white"
              >
                <Tab label="PLAY" value="0" />
                <Tab label="COLLECTION" value="1" />
                <Tab label="MINT" value="2" />
                <Tab label="BURN" value="3" />

                <Tab label="CONNECT" value="4" />

              </TabList>
            </Box>

            <TabPanel value="0">
              <Typography variant="h2" color="secondary" component="div">
                Home
              </Typography>
            </TabPanel>
            <TabPanel value="1">
              <Collection />
            </TabPanel>

            <TabPanel value="2">
              <MintHome />
            </TabPanel>
            <TabPanel value="3">
              <BurnPack />
            </TabPanel>
            <TabPanel value="4">
              <ConnectWallet />
            </TabPanel>
          </TabContext>
          <Footer/>
        </Box>
      </Provider>
    );
}
return null;
}
