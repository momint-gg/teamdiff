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

const Layout = ({children}) => {
    return (
        <>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1,
                m: 1,
                borderRadius: 1,
                alignItems: 'center',
            }}>
            <Image
                src={logo}
                alt="TeamDiff logo"
                width="300px"
                height="75px" />
            <Link label="PLAY" sx={{ fontSize: 30 }} href="/play">PLAY</Link>
            <Link label="COLLECTION" sx={{ fontSize: 30 }} href="/collection">COLLECTION</Link>
            <Link label="MINT" value="2" sx={{ fontSize: 30 }} href="/mintHome">MINT</Link>
            <Link label="BURN" value="3" sx={{ fontSize: 30 }} href="/burnPack">BURN</Link>
            <WalletLogin />
        </Box><div>
                {children}
            </div></>

    )
}

export default Layout