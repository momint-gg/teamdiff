import 'bootstrap/dist/css/bootstrap.css';
import { Container, Box, Typography, Button, Paper, Fab } from "@mui/material";
import Image from 'next/image';
import profilePic from '../assets/images/example.png';
import StarterPackContents from '../components/StarterPackContents';
import Mint from './mint.js';

export default function MintHome() {

    return(
        <Box>
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
                    <Fab variant="extended" size="small" color="primary" aria-label="add">
                        Mint
                    </Fab>
                    <Fab variant="extended" size="small" color="white" aria-label="add" href={"#"}>
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
        <Box>
         <StarterPackContents/>
        </Box>
            {/*TODO: how do we want to navigate to Mint page? mount a new component or navigate to a new page? I think we should */}
            <Box>
                <Mint>

                </Mint>
            </Box>
        </Box>

    );
}