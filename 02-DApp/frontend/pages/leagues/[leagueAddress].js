import { Fragment } from "react";
import {
  Card,
  Fab,
  Paper,
  Typography,
  CardActions,
  Button,
  Avatar,
  Box,
  Grid,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";

import { useRouter } from "next/router";

//Web3 Imports
import { ethers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import * as utils from "@ethersproject/hash";

//Wagmi imports
import {
  useAccount,
  useConnect,
  useSigner,
  useProvider,
  useContract,
  useEnsLookup,
} from "wagmi";
//Contract imports
import * as CONTRACT_ADDRESSES from "../../../backend/contractscripts/contract_info/contractAddresses.js";
import LeagueOfLegendsLogicJSON from "../../../backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json";
import WhitelistJSON from "../../../backend/contractscripts/contract_info/abis/Whitelist.json";
import constants from "../../constants";

// export default function LeagueDetails({ leagueData, leagueAddress, isJoined, setLeagueOpen }) {
export default function LeagueDetails() {
  //Router params
  const router = useRouter();

  //WAGMI Hooks
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const [{ data: signerData, error, loading }, getSigner] = useSigner({
    onSuccess(data) {
      console.log("Success", data);
    },
  });
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  //   const [leagueAddress, setLeagueAddress] = useState(router.query.leagueAddress);
  const [isLeagueMember, setIsLeagueMember] = useState(false);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false);
  const [isOnWhitelist, setIsOnWhitelist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [nftResp, setNFTResp] = useState(null);
  const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);

  const [isSettingLineup, setIsSettingLineup] = useState(false);
  //const [import {  } from "module";]

  //Menu Import
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSetAthlete = (athleteNum) => {
    setAnchorEl(null);
    lineup[athleteNum] = athleteNum;
    console.log("lineup: " + lineup);
  };

  useEffect(() => {
    // setPackNFTs([]);
    setAthleteNFTs([]);
    // console.log("leagueAddress: " + leagueAddress)
    // console.log("router: " + JSON.stringify(router.query, null, 2));
    //console.log("signerData: " + JSON.stringify(signerData, null, 2));
    if (accountData && router.query.leagueAddress) {
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      setLeagueProxyContract(LeagueProxyContract);

      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        const isInLeague = await LeagueProxyContract.inLeague(
          accountData.address
        );
        setIsLeagueMember(isInLeague);
        console.log("isInLeague: " + isInLeague);
        const leagueAdmin = await LeagueProxyContract.admin();
        //console.log(leagueAdmin);
        setIsLeagueAdmin(leagueAdmin == accountData.address);

        //Get whitelist of Proxy, to confirm connected user is on whitelist
        const whitelistAddress = await LeagueProxyContract.whitelistContract();
        //console.log("whitelistAddy: " + whitelistAddress);
        const WhitelistContract = new ethers.Contract(
          whitelistAddress,
          WhitelistJSON.abi,
          provider
        );
        const isOnWhitelist = await WhitelistContract.whitelist(
          accountData.address
        );
        //console.log("user is on whitelist: " + isOnWhitelist);
        setIsOnWhitelist(isOnWhitelist);
        setIsLoading(false);
      }

      // declare the async data fetching function
      const getNFTData = async () => {
        const web3 = createAlchemyWeb3(constants.ALCHEMY_LINK);

        const nfts = await web3.alchemy.getNfts({
          owner: accountData.address,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        });

        setNFTResp(nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: constants.CONTRACT_ADDR,
            tokenId: token,
          });
          //console.log("Token #" + token + " metadata: " + JSON.stringify(response, null, 2));
          if (!response.title?.includes("Pack")) {
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
          }
        }
      };

      getNFTData().catch((error) => {
        console.log("fetch NFT DATA error: " + error);
      });
      fetchData();
    } else {
      //alert("no account data or league Address found, please refresh.");
      console.log("no account data or league Address found");
      console.log("router: " + JSON.stringify(router.query, null, 2));
      //   console.log("leagueAddress: " + leagueAddress);
    }
  }, [accountData?.address]);

  const joinLeagueHandler = async () => {
    console.log("joining league: " + router.query.leagueAddress);
    //console.log("signer dataL: " + JSON.stringify(signerData, null, 2));
    const leagueProxyContractWithSigner =
      leagueProxyContract.connect(signerData);
    const joinLeagueTxn = await leagueProxyContractWithSigner
      .joinLeague()
      // .joinLeague({
      //     gasLimit: 20000000
      // })
      .then((res) => {
        console.log("txn result: " + JSON.stringify(res, null, 2));
        console.log("Txn: " + JSON.stringify(joinLeagueTxn, null, 2));
        console.log("joined league");
      })
      .catch((error) => {
        //console.log("")
        alert("Join League error: " + error.message);
      });
  };

  const submitLineup = async () => {
    const leagueProxyContractWithSigner =
      leagueProxyContract.connect(signerData);

    const setLineupTxn = await leagueProxyContractWithSigner
      .setLineup(lineup, {
        gasLimit: 10000000,
      })
      .then((res) => {
        console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsSettingLineup(true);
        console.log("Setting lineup in progress...");
        //console.log("With invite values: " + inviteListValues);
      })
      .catch((error) => {
        alert("Create League error: " + error.message);
      });
  };

  return (
    <Box>
      {isLoading ? (
        <Box>
          <Typography>Loading</Typography>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isLeagueMember ? (
            <>
              {/* <Avatar
                  alt="League Image"
                  src={leagueData?.image?.examplePic.src}
                  sx={{ bgcolor: "white", position: "absolute" }}
                /> */}
              <Box sx={{ marginLeft: 6 }}>
                <Typography variant="h2" color="secondary" component="div">
                  {leagueName}
                </Typography>

                {/* <Typography variant="body1" color="white">
                    Your current standing: {leagueData?.standing}
                  </Typography> */}

                <Typography
                  variant="h4"
                  color="secondary"
                  component="div"
                  sx={{ marginTop: 5 }}
                >
                  SET YOUR LINEUP!
                </Typography>

                <Grid container spacing={5}>
                  <Grid item>
                    <Paper
                      elevation={0}
                      style={{
                        background:
                          "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Fab
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                      >
                        Set 1
                      </Fab>
                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        {athleteNFTs.map(
                          (athlete, index) =>
                            athlete.id.tokenId % 10 == 0 && (
                              <MenuItem onClick={() => handleSetAthlete(0)}>
                                {"Athlete #" + athlete.id.tokenId}
                              </MenuItem>
                            )
                        )}
                        {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem> */}
                      </Menu>
                      {lineup[0] != null && (
                        <Typography>{"lineup[0] = " + lineup[0]}</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item>
                    <Paper
                      elevation={0}
                      style={{
                        background:
                          "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Fab
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                      >
                        Set 2
                      </Fab>
                      {/* <Menu
                            //id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        >
                            {athleteNFTs.map((athlete, index) => 
                                (athlete.id.tokenId % 10 == 1 && 
                                    <MenuItem onClick={() => (handleSetAthlete(1))}>{"Athlete #" + athlete.id.tokenId}</MenuItem>
                                )
                            )
                            }
                            {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem> }
                        </Menu>                         */}
                      {lineup[1] != null && (
                        <Typography>{"lineup[1] = " + lineup[1]}</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item>
                    <Paper
                      elevation={0}
                      style={{
                        background:
                          "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Fab>Set 3</Fab>
                      {lineup[2] != null && (
                        <Typography>{"lineup[21] = " + lineup[2]}</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item>
                    <Paper
                      elevation={0}
                      style={{
                        background:
                          "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Fab>Set 4</Fab>
                      {lineup[3] != null && (
                        <Typography>{"lineup[3] = " + lineup[3]}</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item>
                    <Paper
                      elevation={0}
                      style={{
                        background:
                          "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                        width: 150,
                        height: 200,
                      }}
                    >
                      <Fab>Set 5</Fab>
                      {lineup[4] != null && (
                        <Typography>{"lineup[4] = " + lineup[4]}</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Fab onClick={submitLineup}>Submit Lineup</Fab>
                </Grid>
              </Box>
              {isLeagueAdmin && (
                <Box>
                  <Typography>Admin Actions</Typography>
                  <ul>
                    <li>Add Users to Whitelist</li>
                  </ul>
                </Box>
              )}
            </>
          ) : isOnWhitelist ? (
            <>
              <Typography>
                {"You are whitelisted for this league, click below to accept the invitation to: " +
                  leagueName}
              </Typography>
              <Fab onClick={joinLeagueHandler}>Join League</Fab>
            </>
          ) : (
            <>
              <Typography>
                {"IDK how tf you got here, but you aren't whitelisted for this league, please contact the admin " +
                  " of the league if you would like to be added."}
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  );
}
