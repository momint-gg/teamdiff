import { useAccount, useConnect, useSigner, useProvider, useContract, useEnsLookup } from 'wagmi'
import {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import {Box, CircularProgress, Typography, Button, Chip, Container, Paper, Fab, Grid} from "@mui/material";
import CONSTANTS from "../Constants.js";
import GameItemsJSON from "../utils/GameItems.json";
import AthleteCard from "../components/AthleteCard";

export default function BurnPack({setDisplay}) {
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
    const [mintedIndices, setMintedIndices] = useState(null);
    //Use Effect for component mount
    useEffect(() => {
        if (accountData) {
            //Initialize connections to GameItems contract
            const GameItemsContract = new ethers.Contract(
                CONSTANTS.CONTRACT_ADDR,
                GameItemsJSON.abi,
                provider
            );
            setGameItemsContract(GameItemsContract);

            //Callback for when pack burned function is called from GameItems contracts
            const packBurnedCallback = (athleteIndices, signer) => {
                if (signer == accountData.address) {
                    setIsMinting(false);
                    setHasMinted(true);
                    //console.log("Finsihed minting indexes: " + athleteIndices[0] + ", " + athleteIndices[1] + ", " + athleteIndices[2] + ", " + athleteIndices[3] + ", " + athleteIndices[4]);
                    setMintedIndices(athleteIndices);
                }
            }

            //Listen to event for when pack burn function is called
            GameItemsContract.once('packBurned', packBurnedCallback);
        } else {
            console.log("no account data found!");
        }
    }, [])


    const burnStarterPack = async () => {
        if (gameItemsContract) {
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            //  setGameItemsContract(gameItemsContract.connect(signerData));
            let gameItemsContractWithSigner = gameItemsContract.connect(signerData);

            const burnTxn = await gameItemsContractWithSigner.burnStarterPack({
                gasLimit: 10000000,
                //nonce: nonce || undefined,
            })
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
            {(accountData && !(isMinting || hasMinted)) &&
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
                        Burn Starter Pack
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
                    <Button onClick={burnStarterPack} variant="contained" color="inherit"
                            style={{color: 'black', borderRadius: "40px", width: '10%', fontSize: 20}}>
                        BURN
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
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Typography>
                    Your Starter Pack has been burned
                </Typography>
                {/*TODO: show a collection of their newly minted athlete cards on the screen*/}
                {mintedIndices?.map(index => (
                    <a href={'https://testnets.opensea.io/assets/'+ gameItemsContract.address + '/' + index}>
                        {"View Athlete #" + index + " on OpenSea."}
                    </a>
                ))}
                <Typography>
                    Note that it may take a few minutes for images and metadata to properly load on OpenSea.
                </Typography>

            </Box>
            }
            {(!accountData && !hasMinted && !isMinting) &&
            <div> Please connect your wallet. </div>
            }
        </Box>
    )
}