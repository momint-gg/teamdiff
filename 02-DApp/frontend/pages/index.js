import React from "react";
import Footer from "../components/Footer";
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel'
import TabList from '@mui/lab/TabList';
import Link from 'next/link';
import TabContext from '@mui/lab/TabContext';
import Typography from '@mui/material/Typography';
import logo from '../assets/images/logo-horizontal.png';
import Image from 'next/image';
// import '../assets/fonts/Exo/Exo-VariableFont_wght.ttf';

//* ************ */
// Custom Page Imports
//********************** */
import About from './about';
import MintPack from './mintPack';
import Collection from './collection';
import MintHome from './mintHome';
import Play from './play';

//* ****************** */
//  Component Imports */
//* ****************** */
import ConnectWallet from "./connectWallet";
import BurnPack from "./burnPack";
import WalletLogin from "../components/WalletLogin";

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

export default function Index(props) {
  const [value, setValue] = React.useState("0");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (typeof window !== "undefined") {
    return (
      <Box>
        <Box sx={{paddingLeft: 5, paddingRight: 5}}>
          
          {/* <TabContext value={value}> */}
            <Box sx={{marginLeft:-5, marginRight: -5, borderBottom: 1, borderColor: 'white'}}>
              {/* //Do we want to have this be a SPA with all tabs?
              This might be an issue when certain tabs are fetching data, but maybe not */}
              {/* <TabList 
                onChange={handleChange} 
                indicatorColor="secondary"
                textColor="white"
                sx= {{marginLeft: 5}}
              > */}
                {/* <Link label="PLAY" sx={{fontSize: 30}} href="/play">PLAY</Link>
                <Link label="COLLECTION" sx={{fontSize: 30}} href="/collection">COLLECTION</Link>
                <Link label="MINT" value="2" sx={{fontSize: 30}} href="/mintHome">MINT</Link>
                <Link label="BURN" value="3" sx={{fontSize: 30}} href="/burnPack">BURN</Link> */}
              {/* </TabList> */}
            </Box>
            {/* <TabPanel value="0">
              <Typography variant="h2" color="secondary" component="div">
                <Play />
              </Typography>
            </TabPanel> */}
            {/* <TabPanel value="1">
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
            </TabPanel> */}
          {/* </TabContext> */}
        </Box>
        <Box>
          <Footer />
        </Box>
        </Box>
    );
  }
  return null;
}
