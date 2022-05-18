import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import AthleteCard from "../components/AthleteCard";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
} from "@mui/material";
import constants from "../Constants";
import MyLeagues from "./myLeagues";
import JoinLeague from "./joinLeague";
import CreateLeague from "./createLeague";
import { Fragment } from "react";
import { GiPodium } from "react-icons/gi";
import { MdGroupAdd } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
//Router
import { useRouter } from 'next/router'

import { useMediaQuery } from "react-responsive";

export default function Play() {
  //Router
  const router = useRouter();

  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  // const [displayMyLeagues, setDisplayMyLeagues] = useState(false);
  // const [displayJoinLeague, setDisplayJoinLeague] = useState(false);
  // const [displayCreateLeague, setDisplayCreateLeague] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleClick = () => {
    setMenu((menu) => !menu);
  };
  const handleClickAway = () => {
    setMenu(false);
  };

  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  // const handleViewLeaguesClick = (e) => {
  //   e.preventDefault()
  //   const href= "/leagues/" + leagueAddress;
  //   router.push(href)
  // }

  // const handleCreateLeaguClick = (e) => {
  //   e.preventDefault()
  //   const href= "/leagues/" + leagueAddress;
  //   router.push(href)
  // }

  // const handleClick = (e) => {
  //   e.preventDefault()
  //   const href= "/leagues/" + leagueAddress;
  //   router.push(href)
  // }

  return (

    <Box>
      {/* {!(displayMyLeagues || displayCreateLeague || displayJoinLeague) && ( */}
      {accountData ? (
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() => router.push("/myLeagues")}>
              {myLeagues}
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() =>  router.push("/joinLeague")}>
              {joinLeague}
            </Card>
          </Grid>
          <Grid item xs={isMobile ? 12 : 4}>
            <Card
              variant="outlined"
              onClick={() =>  router.push("/createLeague")}
            >
              <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      Create League
                    </Typography>
                  ) : (
                    <Typography variant="h5" color="secondary" component="div">
                      Create League
                    </Typography>
                  )}
                  <FaCrown size={"3rem"} />
                </CardContent>
                <CardActions></CardActions>
              </Fragment>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography>
          Please connect wallet
        </Typography>
      )}

    </Box>
  );
}
