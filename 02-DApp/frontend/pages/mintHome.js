import 'bootstrap/dist/css/bootstrap.css';
import { Container, Box, Typography, Button, Paper, Fab } from "@mui/material";
import Image from 'next/image';
import profilePic from '../assets/images/example.png';
import StarterPackContents from '../components/starterPackContents';


export default function MintHome() {

    return(
        <Box>
        <Box
        /*this should be in constants style sheet as the wrapper box for all pages*/
        sx={{
            backgroundColor: 'primary.dark',
            display: 'flex',
            flexDirection: 'row'
          }}
        >
            <Container 
                maxWidth="sm"
                sx={{
                    border: 1,
                }}
                >
                <Paper elevation={3}>
                    <Typography>
                        Title
                    </Typography>
                    <Typography>
                        Mint your pack today
                    </Typography>
                    <Fab variant="extended" size="small" color="secondary" aria-label="add">
                        Mint
                    </Fab>
                    <Fab variant="extended" size="small" color="white" aria-label="add">
                    View Collection
                    </Fab>
                </Paper> 
                
            </Container>
            <Container  maxWidth="sm">
                <Image
                    src={profilePic}
                    alt="Picture of the author"
                    width={500}
                    height={500}
                />
                
            </Container>
        </Box>
        <Box>
         <StarterPackContents/>
        </Box>
        </Box>

    );
}