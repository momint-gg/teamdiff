import { useState, useEffect } from "react";
import { useAccount, useDisconnect
} from "wagmi";
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

import { SignMessage } from '../components/SignMessage'

import { useMediaQuery } from "react-responsive";

export default function Play() {
  //Router
  const router = useRouter();
  //WAGMI Hooks
  const { data: accountData, isLoading, error } = useAccount({ ens: true });
  // const { data: ensName } = useEnsName()
  // const { data: ensAvatar } = useEnsAvatar()
  const { disconnect } = useDisconnect()


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

  useEffect(() => {
    if(accountData)
     console.log("account data in use: " + accountData.address);
  }, [accountData?.address])

  return (

    <Box>
      {/* <SignMessage/> */}
      {/* {!(displayMyLeagues || displayCreateLeague || displayJoinLeague) && ( */}
      {accountData ? (
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() => router.push("/myLeagues")}>
            <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      My Leagues
                    </Typography>
                  ) : (
                    <Typography variant="h5" color="secondary" component="div">
                      My Leagues
                    </Typography>
                  )}
                  <FaCrown size={"3rem"} />
                </CardContent>
                </Fragment>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined" onClick={() =>  router.push("/joinLeague")}>
            <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      Join League
                    </Typography>
                  ) : (
                    <Typography variant="h5" color="secondary" component="div">
                      Join League
                    </Typography>
                  )}
                  <FaCrown size={"3rem"} />
                </CardContent>
                </Fragment>
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
