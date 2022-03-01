import { useAccount, useConnect, useContractRead, useContract, useEnsLookup } from 'wagmi'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Button, Chip, Container, Paper, Fab } from "@mui/material";

export default function Mint({setDisplay}) {
  const [{ data: connectData, error: connectError }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  console.log(setDisplay)
  if (true) {
    return (
        <Box>
          <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplay(false)}>
            &#60; BACK
          </Fab>
        <Container 
        maxWidth='lg'
        justifyContent="center"
        alignItems="center"
        >
         {/* <img src={accountData.ens?.avatar} alt="ENS Avatar" /> */}
          {/* <div>{accountData.ens?.name
//             ? `${accountData.ens?.name} (${accountData.address})`
//             : accountData.address}</div>
//          <div>Connected to {accountData.connector.name}</div>
//          <Button variant="outlined" color="secondary" onClick={disconnect}>Disconnect</Button> */}
         {/* background: ;
// filter: blur(100px); */}
{/* //             <Paper elevation={0} style={{background: 'linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)'}}/>
//             <Chip style={{width: 120, background: 'linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)'}}>
//                 This is a Chip
//             </Chip> */}
         
        <Box
            justifyContent="center"
            alignItems="center"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                m: 1,
                width: 260,
                height: 350,
                },
            }}
            >
            <Paper elevation={0} style={{background: 'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)', filter: 'blur(35px)'}} />
            <img src='/starterPack.png' style={{position: 'absolute'}}/>
        </Box>
        
        <Box
            justifyContent="center"
            alignItems="center"
            sx={{
                display: 'flex',
            }}
        >
            <Typography variant="h2" color="white" component="div">
                Mint Starter Pack
            </Typography>
        </Box>
        <Box
            justifyContent="center"
            alignItems="center"
            sx={{
                display: 'flex',
                paddingTop: '20px'
            }}
        >
        <Button variant="contained" color="inherit" style={{color:'black', borderRadius:"40px", width:'10%', fontSize:20}}>
                MINT
        </Button>
        </Box>
        </Container>
        </Box>
    )
  }
  return (<div></div>)

  // return (
  //   <Box>
  //     {connectData.connectors.map((x) => (
  //       <Button variant="outlined" color="secondary" disabled={!x.ready} key={x.id} onClick={() => connect(x)}>
  //         {x.name}
  //         {!x.ready && ' (unsupported)'}
  //       </Button>          
  //     ))}
  //     {connectError && <div>{connectError?.message ?? 'Failed to connect'}</div>}
  //   </Box>
  // )
}