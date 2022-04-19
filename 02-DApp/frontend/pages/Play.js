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

export default function Play() {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [displayMyLeagues, setDisplayMyLeagues] = useState(false);
  const [displayJoinLeague, setDisplayJoinLeague] = useState(false);
  const [displayCreateLeague, setDisplayCreateLeague] = useState(false);

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

  const myLeagues = (
    <Fragment>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h5" color="secondary" component="div">
          My Leagues
        </Typography>
        <GiPodium />
      </CardContent>
      <CardActions></CardActions>
    </Fragment>
  );

  const joinLeague = (
    <Fragment>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h5" color="secondary" component="div">
          Join League
        </Typography>
        <MdGroupAdd />
      </CardContent>
      <CardActions></CardActions>
    </Fragment>
  );

  const createLeague = (
    <Fragment>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h5" color="secondary" component="div">
          Create League
        </Typography>
        <FaCrown />
      </CardContent>
      <CardActions></CardActions>
    </Fragment>
  );

  return (
    <Box>
      {!(displayMyLeagues || displayCreateLeague || displayJoinLeague) && (
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() => setDisplayMyLeagues(true)}>
              {myLeagues}
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() => setDisplayJoinLeague(true)}>
              {joinLeague}
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              variant="outlined"
              onClick={() => setDisplayCreateLeague(true)}
            >
              {createLeague}
            </Card>
          </Grid>
        </Grid>
      )}
      {displayMyLeagues && (
        <Box>
          <MyLeagues setDisplay={setDisplayMyLeagues} />
        </Box>
      )}
      {displayJoinLeague && (
        <Box>
          <JoinLeague setDisplay={setDisplayJoinLeague} />
        </Box>
      )}
      {displayCreateLeague && (
        <Box>
          <CreateLeague setDisplay={setDisplayCreateLeague} />
        </Box>
      )}
    </Box>
  );
}
