import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import AthleteCard from "../components/AthleteCard";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import constants from "../Constants";
import MyLeagues from "./myLeagues";
import JoinLeague from "./joinLeague";
import CreateLeague from "./createLeague";
import { Fragment } from "react";
import { GiPodium } from "react-icons/gi";
import { MdGroupAdd } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
//Router
import { useRouter } from "next/router";
import { useMediaQuery } from "react-responsive";

export default function Play() {
  //Router
  const router = useRouter();
  //WAGMI Hooks
  const { data: accountData, isLoading, error } = useAccount({ ens: true });
  // const { data: ensName } = useEnsName()
  // const { data: ensAvatar } = useEnsAvatar()
  const { disconnect } = useDisconnect();
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);

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

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const setAccountData = async () => {
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const accountAddress = await signer.getAddress();
        setSigner(signer);
        setConnectedAccount(accountAddress);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };
    setAccountData();
    provider.provider.on("accountsChanged", (accounts) => {
      setAccountData();
    });
    provider.provider.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });
    provider.on("network", (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        window.location.reload();
      }
    });
  }, [connectedAccount]);

  return (
    <Box>
      {/* <SignMessage/> */}
      {/* {!(displayMyLeagues || displayCreateLeague || displayJoinLeague) && ( */}
      {isConnected ? (
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card
              sx={{
                background:
                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                borderRadius: 20,
              }}
              variant="outlined"
              onClick={() => router.push("/myLeagues")}
            >
              <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      My Leagues
                    </Typography>
                  ) : (
                    <Typography variant="h4" color="secondary" component="div">
                      My Leagues
                    </Typography>
                  )}
                  <EmojiEventsIcon fontSize={"large"} />
                </CardContent>
              </Fragment>
            </Card>
            <br></br>
            <Typography
              sx={{
                textAlign: "center",
                paddingLeft: 2,
                paddingRight: 2,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Card
              sx={{
                background:
                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                borderRadius: 20,
              }}
              variant="outlined"
              onClick={() => router.push("/joinLeague")}
            >
              <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      Join League
                    </Typography>
                  ) : (
                    <Typography variant="h4" color="secondary" component="div">
                      Join League
                    </Typography>
                  )}
                  <GroupAddIcon fontSize={"large"} />
                </CardContent>
              </Fragment>
            </Card>
            <br></br>
            <Typography
              sx={{
                textAlign: "center",
                paddingLeft: 2,
                paddingRight: 2,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Card
              variant="outlined"
              sx={{
                background:
                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                borderRadius: 20,
              }}
              onClick={() => router.push("/createLeagueLanding")}
            >
              <Fragment>
                <CardContent sx={{ textAlign: "center" }}>
                  {isMobile ? (
                    <Typography color="secondary" component="div" fontSize={18}>
                      Create League
                    </Typography>
                  ) : (
                    <Typography variant="h4" color="secondary" component="div">
                      Create League
                    </Typography>
                  )}
                  <FaCrown size={"2rem"} />
                </CardContent>
                <CardActions></CardActions>
              </Fragment>
            </Card>
            <br></br>
            <Typography
              sx={{
                textAlign: "center",
                paddingLeft: 2,
                paddingRightt: 2,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <ConnectWalletPrompt accessing={"the Play Page"} />
      )}
    </Box>
  );
}
