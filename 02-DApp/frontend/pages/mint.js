import { useAccount, useConnect, useSigner, useProvider, useContract, useEnsLookup } from 'wagmi'
import {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Button, Chip, Container, Paper, Fab } from "@mui/material";
import CONTRACT_ADDR from "../Constants.js";
import GameItemsJSON from "../utils/GameItems.json";

export default function Mint({setDisplay}) {
  const [{ data: connectData, error: connectError }, connect] = useConnect()
  const [mintedPackId, setMintedPackId] = useState(null);
  const [{ data: accountData }, disconnect] = useAccount({
      fetchEns: true,
  })
    const provider = useProvider()
  const [{ data: signerData, error, loading }, getSigner] = useSigner()
    const [gameItemsContract, setGameItemsContract] = useState(null);

    //Use Effect for component mount
      useEffect(() => {
          if(accountData) {
              const GameItemsContract = new ethers.Contract(
                  "0xB331d0Dd40eaabCdF00c55942f3Bfc1F58Bd159A",
                  GameItemsJSON.abi,
                  provider
              );
              setGameItemsContract(GameItemsContract);
              const packMintedCallback = (address, packID) => {
                  setMintedPackId(packID);
              }
              //Listen to event for when pack mint function is called
              GameItemsContract.once('packMinted', packMintedCallback);
          }
          else {
              console.log("no account data found!");
          }
      }, [])




    const mintStarterPack = async () => {
        //console.log("callling mintStartPAcks!")
        if(gameItemsContract) {

            //console.log("gameItemsContract found")
            /*TODO: How do I attach a signer to this*/
            const mintTxn = await gameItemsContract.mintStarterPack()
                .then((res) => {
                    console.log("txn result: " + JSON.stringify(res, null, 2))
                }).catch((error) => {
                    alert("error: " + error.message)
                });
            console.log('Minting pacck in progress...' + gameItemsContract.min);
            await mintTxn.wait();
            alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameItemsContract.address}/${mintedPackId}`)

            console.log('mintTxn:', mintTxn);
        }
    }


  if (accountData) {
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
            {/*<Fab >*/}
            {/*    Mint Start Pack*/}
            {/*</Fab>*/}
        </Box>
        <Box
            justifyContent="center"
            alignItems="center"
            sx={{
                display: 'flex',
                paddingTop: '20px'
            }}
        >
        <Button onClick={mintStarterPack} variant="contained" color="inherit" style={{color:'black', borderRadius:"40px", width:'10%', fontSize:20}}>
                MINT
        </Button>
        </Box>
        </Container>
        </Box>
    )
  }
  return (<div> Please connect your wallet. </div>)

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