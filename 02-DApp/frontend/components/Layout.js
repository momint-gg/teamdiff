import React from 'react';
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import { Box } from '@mui/material';
import Image from 'next/image';
import WalletLogin from '../components/WalletLogin';
import logo from '../assets/images/logo-horizontal.png';
import Link from 'next/link';
import theme from '../styles/theme';
import { ThemeProvider } from '@mui/material/styles';
import Footer from './Footer';

const Layout = ({children}) => {
    return (
        <>
        <Box component="div" height='100%' backgroundColor='primary.dark'>
        <Box component="body" height='100vh' backgroundColor='primary.dark'>
        
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1,
                m: 1,
                borderRadius: 1,
                alignItems: 'center',
                backgroundColor: 'primary.dark',
            }}
            >
            <Image
                src={logo}
                alt="TeamDiff logo"
                width="300px"
                height="75px" />
            <WalletLogin />
        </Box>
        <Box
            sx={{
                display: 'flex',
                p: 1,
                m: 1,
                borderRadius: 1,
                alignItems: 'center',
                backgroundColor: 'primary.dark',
                display: 'flex',
                justifyContent: 'space-around'
            }}
            >
        <Link label="PLAY" sx={{ fontSize: 30 }} href="/play">PLAY</Link>
        <Link label="COLLECTION" sx={{ fontSize: 30 }} href="/collection">COLLECTION</Link>
        <Link label="MINT" value="2" sx={{ fontSize: 30 }} href="/mintHome">MINT</Link>
        <Link label="BURN" value="3" sx={{ fontSize: 30 }} href="/burnPack">BURN</Link>
        </Box>
        {/* <Box backgroundColor='primary.dark'> */}
        <div>
            {children}
        </div>
        {/* </Box> */}
        <Footer />
        </Box>
        </Box>
        </>
    )
}

export default Layout