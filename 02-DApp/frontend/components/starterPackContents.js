import "bootstrap/dist/css/bootstrap.css";
import {
  Container,
  Box,
  Grid,
  Fab,
  Typography,
  ImageList,
  ImageListItem,
} from "@mui/material";
import StarterPackAthleteCard from "./StarterPackAthleteCard.js";
// import Image from 'next/image';
// import profilePic from '../assets/images/example.png';
import { useState, useEffect } from "react";
// import { createAlchemyWeb3 } from "@alch/alchemy-web3";
// import constants from "../Constants";
// import { useAccount } from 'wagmi';
// Requiring fs module in which
// readFile function is defined.
// const fs = require('fs');
//import athleteMetadata from '../../backend/datafetcher/nft_metadata_2022-02-13.json';
//import starterPackAthleteCard from './StarterPackAthleteCard';

export default function StarterPackContents({ setDisplay }) {
  //const starterPackAthleteData = Object.keys(athleteMetadata).map((key) => [key, athleteMetadata[key]])

  // if (starterPackAthleteData.length >0) {
  if (true) {
    return (
      <Box
        /*this should be in constants style sheet as the wrapper box for all pages*/
        sx={{
          backgroundColor: "primary.dark",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Fab
          variant="extended"
          size="small"
          aria-label="add"
          onClick={() => setDisplay(false)}
        >
          &#60; BACK
        </Fab>
        <Container>
          {/* <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
            </ImageList> */}
          {/*<Grid container spacing={3}>
                    {starterPackAthleteData.map(athleteData => (
                        <Grid item xs={4}>
                            <StarterPackAthleteCard athleteData={athleteData[1]} />

                        </Grid>
                    ))}
                    </Grid>*/}
          Placeholder
        </Container>
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h2" color="secondary" component="div">
        Please wait while we load colleciton
      </Typography>
    </Box>
  );
}
