import { useAccount, useConnect, useContractRead, useContract, useEnsLookup } from 'wagmi'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Button } from "@mui/material";

export default function ConnectWallet() {
  const [{ data: connectData, error: connectError }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })

  if (accountData) {
    return (
      <Box>
        <img src={accountData.ens?.avatar} alt="ENS Avatar" />
         <div>{accountData.ens?.name
            ? `${accountData.ens?.name} (${accountData.address})`
            : accountData.address}</div>
         <div>Connected to {accountData.connector.name}</div>
         <Button variant="outlined" onClick={disconnect}>Disconnect</Button>
      </Box>
    )
  }

  return (
    <Box>
      {connectData.connectors.map((x) => (
        <Button variant="outlined" disabled={!x.ready} key={x.id} onClick={() => connect(x)}>
          {x.name}
          {!x.ready && ' (unsupported)'}
        </Button>          
      ))}
      {connectError && <div>{connectError?.message ?? 'Failed to connect'}</div>}
    </Box>
  )
}
