import { useAccount, useConnect, useSigner, useProvider, useContract, useEnsLookup } from 'wagmi'
import {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, CircularProgress, Typography, Button, Chip, Container, Paper, Fab } from "@mui/material";
import CONSTANTS from "../Constants.js";
import GameItemsJSON from "../utils/GameItems.json";
import * as utils from "@ethersproject/hash";
import {hexZeroPad} from "@ethersproject/bytes";

export default function MintPack({setDisplay}) {
    const [{data: connectData, error: connectError}, connect] = useConnect()
    const [mintedPackId, setMintedPackId] = useState(null);
    const [{data: accountData}, disconnect] = useAccount({
        fetchEns: true,
    })
    const provider = new ethers.providers.AlchemyProvider("rinkeby", process.env.ALCHEMY_KEY)
    const [{data: signerData, error, loading}, getSigner] = useSigner()
    const [gameItemsContract, setGameItemsContract] = useState(null);
    const [isMinting, setIsMinting] = useState(false);
    const [hasMinted, setHasMinted] = useState(false);
    const [packsAvailable, setPacksAvailable] = useState(null);
    //Use Effect for component mount
    useEffect(async () => {
        if (accountData) {
            //console.log("signer: " + JSON.stringify(signerData, null, 2));
            const GameItemsContract = new ethers.Contract(
                CONSTANTS.CONTRACT_ADDR,
                GameItemsJSON.abi,
                provider
            );
            setGameItemsContract(GameItemsContract);
            const packsAvail = await GameItemsContract.packsAvailable();
            setPacksAvailable(packsAvail);

            const packMintedCallback = (address, packID) => {
                setIsMinting(false);
                setHasMinted(true);
            }
            // A filter that matches my Signer as the author
            //TODO this signerData won't always be intilized immediately
            // const signerAddress = await signerData.getAddress();
            const signerAddress = "0x14D8DF624769E6075769a59490319625F50B2B17";

            console.log(hexZeroPad(signerAddress, 32));
            let filter = {
                address: GameItemsContract.address,
                topics: [
                    utils.id("packMinted(address,uint256)"),
                    //"0x00000000000000000000000014d8df624769e6075769a59490319625f50b2b17"
                    //TODO something wrong with this line
                    //hexZeroPad(signerAddress, 32)
                ]
            };

            //TODO filter this listener to only trigger when pack Minted is called by signerAddress
            //Listen to event for when pack mint function is called
            // GameItemsContract.once('packMinted', packMintedCallback);
            GameItemsContract.on(filter, packMintedCallback);

        } else {
            console.log("no account data found!");
        }
    }, [])


    const mintStarterPack = async () => {
        if (gameItemsContract) {
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            //  setGameItemsContract(gameItemsContract.connect(signerData));
            let gameItemsContractWithSigner = gameItemsContract.connect(signerData);

            const mintTxn = await gameItemsContractWithSigner.mintStarterPack()
                .then((res) => {
                    console.log("txn result: " + JSON.stringify(res, null, 2))
                    setIsMinting(true)
                    console.log('Minting pack in progress...')

                }).catch((error) => {
                    alert("error: " + error.message)
                });
        }
    }

    return (
        <Box>
            <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplay(false)}>
                &#60; BACK
            </Fab>
            {(accountData && !(isMinting || hasMinted)) && (packsAvailable != 0) &&
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
                        <Paper elevation={0} style={{
                            background: 'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                            filter: 'blur(35px)'
                        }}/>
                        <img src='/starterPack.png' style={{position: 'absolute'}}/>
                    </Box>

                    <Box
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        sx={{
                            display: 'flex',
                        }}
                    >
                        <Typography variant="h2" color="white" component="div">
                            Mint Starter Pack
                        </Typography>
                        {(packsAvailable != null) &&
                            <h3>
                                {"There are " + packsAvailable + " packs still available"}
                            </h3>
                        }
                        {/*<Fab >*/}
                        {/*    MintPack Start Pack*/}
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
                        <Button onClick={mintStarterPack} variant="contained" color="inherit"
                                style={{color: 'black', borderRadius: "40px", width: '10%', fontSize: 20}}>
                            MINT
                        </Button>

                    </Box>
                </Container>
            }
            {(isMinting) && (
                <Container>
                <Typography>
                    Your stuff is minting...
                </Typography>
                <CircularProgress />
                </Container>
                )}
            {(hasMinted) &&
                <Box>
                <Typography>
                    Your Team Diff Starter Pack is all done minting!
                </Typography>
                <a href={'https://testnets.opensea.io/assets/'+ gameItemsContract.address + '/0'}>
                 View on OpenSea.
                </a>
                </Box>
            }
            {(!accountData && !hasMinted && !isMinting) &&
                <div> Please connect your wallet. </div>
            }
            {(packsAvailable == 0) &&
            <Box>
                <Typography>
                    Sorry, all packs have already been minted :(
                </Typography>
            </Box>
            }
        </Box>
    )
}