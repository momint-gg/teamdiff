import "bootstrap/dist/css/bootstrap.css";
import { Container, Box, Typography, Button, Paper, Fab } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import profilePic from "../assets/images/starter-pack.png";
import StarterPackContents from "../components/StarterPackContents";
import MintPack from "./mintPack.js";
import { useMediaQuery } from "react-responsive";

export default function MintHome() {
  const [displayMint, setDisplayMint] = useState(false);
  const [displayCollection, setDisplayCollection] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  return (
    <Box>
      {!(displayMint || displayCollection) && (
        <Box>
          {isMobile ? (
            <Box
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
                  <Typography variant="h4" color="white" component="div">
                    Starter Pack
                  </Typography>
                  <Typography color="white" component="div">
                    Mint a starter pack and get 5 unique athlete NFTs, which allow
                    you to build a roster and get right into the action.
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Image
                      src={profilePic}
                      alt="Picture of the author"
                      width="155px"
                      height="225px"
                    />
                  </Box>
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
            </Box>
          ) : (
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
                  Mint a starter pack and get 5 unique athlete NFTs, which allow
                    you to build a roster and get right into the action.
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
              {isMobile ? (
                <Box>
                  <Image
                    src={profilePic}
                    alt="Picture of the author"
                    width="310px"
                    height="450px"
                  />
                </Box>
              ) : (
                <Container sx={{ marginLeft: "4rem" }}>
                  <Image
                    src={profilePic}
                    alt="Picture of the author"
                    width="310px"
                    height="450px"
                  />
                </Container>
              )}
            </Box>
          )}{" "}
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
