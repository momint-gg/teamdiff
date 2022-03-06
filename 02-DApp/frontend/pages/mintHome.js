import 'bootstrap/dist/css/bootstrap.css';
import { Container, Box, Typography, Button, Paper, Fab } from "@mui/material";
import Image from 'next/image';
import { useState } from 'react';
import profilePic from '../assets/images/example.png';
import StarterPackContents from '../components/StarterPackContents';
import MintPack from './mintPack.js';

export default function MintHome() {
    const [displayMint, setDisplayMint] = useState(false);
    const [displayCollection, setDisplayCollection] = useState(false);

    return(
        <Box>
        {!(displayMint || displayCollection) && 
        <Box
        /*this should be in constants style sheet as the wrapper box for all pages*/
        sx={{
            backgroundColor: 'primary.dark',
            display: 'flex',
            flexDirection: 'row',
            alignContent: "center"
          }}
        >
            <Container 
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    alignItems: "center"
                }}
                >
                <Box>
                    <h2
                    >
                        Starter Pack
                    </h2>
                    <h5
                    >
                        The starter pack is the perfect pack for a beginner. Minting this pack will provide 6 unique NFT cards, which will allow you
                        to get right into the action.
                    </h5>
                    {/*TODO: Only show this mint button if user is logged in*/}
                    <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplayMint(true)}>
                        Mint
                    </Fab>
                    <Fab variant="extended" size="small" color="white" aria-label="add" onClick={() => setDisplayCollection(true)}>
                    View Collection
                    </Fab>
                </Box>
                
            </Container>
            <Container  maxWidth="sm">
                <Image
                    src={profilePic}
                    alt="Picture of the author"
                    // width={60%
                    //height=
                />
                
            </Container>
        </Box>
        }
        {displayCollection &&
            <Box>
                <StarterPackContents setDisplay={setDisplayCollection}/>
            </Box>
        }
        {displayMint && 
        <Box>
            <Box>
                <MintPack setDisplay={setDisplayMint} />
            </Box>
        </Box>
        }
        </Box>

    );
}