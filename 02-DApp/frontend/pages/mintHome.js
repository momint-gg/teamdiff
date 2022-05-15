import "bootstrap/dist/css/bootstrap.css";
import { Container, Box, Typography, Button, Paper, Fab } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import profilePic from "../assets/images/starter-pack.png";
import StarterPackContents from "../components/StarterPackContents";
import MintPack from "./mintPack.js";

export default function MintHome() {
  const [displayMint, setDisplayMint] = useState(false);
  const [displayCollection, setDisplayCollection] = useState(false);

  return (
    <Box>
      {!(displayMint || displayCollection) && (
        <Box
          /* this should be in constants style sheet as the wrapper box for all pages */
          sx={{
            backgroundColor: "primary.dark",
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
          }}
        >
          <Container
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h3" color="white" component="div">
                Starter Pack
              </Typography>
              <Typography variant="h6" color="white" component="div">
                The starter pack is the perfect pack for a beginner. Minting
                this pack will provide 6 unique NFT cards, which will allow you
                to get right into the action.
              </Typography>
              {/*TODO: Only show this mint button if user is logged in*/}
              <Fab
                variant="extended"
                size="large"
                aria-label="add"
                onClick={() => setDisplayMint(true)}
                sx={{
                  marginTop: 5,
                  marginRight: 1,
                  background:
                    "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                  color: "white",
                  fontSize: 20,
                }}
              >
                Mint
              </Fab>
              <Fab
                variant="extended"
                size="large"
                color="white"
                aria-label="add"
                onClick={() => setDisplayCollection(true)}
                sx={{ marginTop: 5, fontSize: 20 }}
              >
                CONTENTS
              </Fab>
            </Box>
          </Container>
          <Container sx={{ marginRight: -50 }}>
            <Image
              src={profilePic}
              alt="Picture of the author"
              width="310px"
              height="450px"
            />
          </Container>
        </Box>
      )}
      {displayCollection && (
        <Box>
          <StarterPackContents setDisplay={setDisplayCollection} />
        </Box>
      )}
      {displayMint && (
        <Box>
          <Box>
            <MintPack setDisplay={setDisplayMint} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
