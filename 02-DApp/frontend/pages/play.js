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
import { useMediaQuery } from "react-responsive";

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

  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  return (
    <Box>
      {!(displayMyLeagues || displayCreateLeague || displayJoinLeague) && (
        <Grid
          container
          direction={isMobile ? "column" : "row"}
          justifyContent="center"
          alignItems="center"
          spacing={isMobile ? 1 : 0}
          sx={{ textAlign: "center" }}
        >
          <Grid item xs={4}>
            <Card
              variant="outlined"
              onClick={() => setDisplayMyLeagues(true)}
              sx={{
                width: { lg: "70%", xs: "20rem" },
                marginLeft: { lg: "15%", xs: 0 },
              }}
            >
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
                  <GiPodium size={"3rem"} />
                </CardContent>
                <CardActions></CardActions>
              </Fragment>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              variant="outlined"
              onClick={() => setDisplayJoinLeague(true)}
              sx={{
                width: { lg: "70%", xs: "20rem" },
                marginLeft: { lg: "15%", xs: 0 },
              }}
            >
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
                  <MdGroupAdd size={"3rem"} />
                </CardContent>
                <CardActions></CardActions>
              </Fragment>
            </Card>
          </Grid>
          <Grid item xs={isMobile ? 12 : 4}>
            <Card
              variant="outlined"
              onClick={() => setDisplayCreateLeague(true)}
              sx={{
                width: { lg: "70%", xs: "20rem" },
                marginLeft: { lg: "15%", xs: 0 },
              }}
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
