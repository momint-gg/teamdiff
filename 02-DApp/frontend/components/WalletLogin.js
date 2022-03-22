import { useAccount, useConnect } from 'wagmi'
import { Box, Button, Avatar, Chip, ClickAwayListener } from '@mui/material'
import { useState } from 'react';
import ConnectWalletModal from './ConnectWalletModal';

export default function WalletLogin() {
    const [{ data: connectData, error: connectError }, connect] = useConnect()
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    })

    const [modalOpen, setModalOpen] = useState(false);
    const [menu, setMenu] = useState(false);
    const handleModalOpen = () => {
        setModalOpen(true);
    };
    const handleModalClose = () => {
        setModalOpen(false);
    };
    const handleClick = () => {
        setMenu((menu) => !menu);
    };
    const handleClickAway = () => {
        setMenu(false);
    };

    var shortenedAddress = "";
    if (accountData?.address) {
        shortenedAddress = `${accountData.address.slice(0, 6)}...${accountData.address.slice(
              accountData.address.length - 4,
              accountData.address.length
            )}`
    }

    return (
        <Box>
        {accountData ? 
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box sx={{ position: 'relative' }}>
                <Chip
                    avatar={<Avatar alt="Avatar" src={accountData.ens?.avatar ? accountData.ens.avatar : "avatar.png"} />}
                    label={accountData.ens?.name
                        ? `${accountData.ens?.name} (${shortenedAddress})`
                        : shortenedAddress}
                    variant="outlined"
                    clickable={true}
                    onClick={handleClick}
                    sx={{height:40, width:170, fontSize:18}}
                />
                {menu ? (
                    <Box
                    sx={{position: "absolute", backgroundColor: "primary.charcoal", borderRadius:2, padding:1}}>
                    <Button variant="outlined" color="secondary" onClick={() => {disconnect(); handleModalClose();}} 
                        sx={{flexBasis:"100%", borderRadius:"40px"}}>
                        DISCONNECT
                    </Button>
                    </Box>
                ) : null}
                </Box>
            </ClickAwayListener>
        :
            <div>
                <Button variant="contained" color="inherit" onClick={handleModalOpen} style={{color:'black', borderRadius:"40px", fontSize:15}}>
                CONNECT WALLET
                </Button>
                {modalOpen && <ConnectWalletModal modalOpen={modalOpen} handleClickAway={handleClickAway} setModalOpen={setModalOpen} />}
            </div>
        }
        </Box>
    )
}