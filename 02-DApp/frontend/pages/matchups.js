import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Container, Grid, Typography } from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { default as React, useEffect, useState } from "react";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import AthletesJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/Athletes.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import Sample from "../../backend/sample.json";
import logo from "../assets/images/example.png";
import LogoIcon from "../assets/images/logoIcon.png";
import LoadingPrompt from "../components/LoadingPrompt.js";
import PlayerStateModal from "../components/PlayerStateModal";
import constants from "../constants";

// todo
const statsData = Sample.statsData;

const data = {
  first: {
    ens: "reg.eth",
    wins: 3,
    athleteData: [
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "TOP",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "JG",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "MID",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "SUP",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "ADC",
      },
    ],
  },
  second: {
    ens: "will.eth",
    wins: 2,
    athleteData: [
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
    ],
  },
};

export default function Matchups({ daysTillLock, daysTillUnlock }) {
  // Router params
  const router = useRouter();
  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );

  // const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  // const useStyles = makeStyles({
  //   cell: {
  //     fontSize: 36,
  //   },
  // });
  // const classes = useStyles()
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(false);
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [currentWeekNum, setCurrentWeekNum] = useState();
  //   const [leagueAddress, setLeagueAddress] = useState(router.query.leagueAddress);
  const [isLeagueMember, setIsLeagueMember] = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [starterAthleteIds, setStarterAthleteIds] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [nftResp, setNFTResp] = useState(null);
  // const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);
  const [athleteContract, setAthleteContract] = useState();
  const [ownedAthletesMetadata, setOwnedAthletesMetadata] = useState([]);
  const [isLineupLocked, setIsLineupLocked] = useState();

  const positions = ["ADC", "Jungle", "Mid", "Support", "Top"];

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const setAccountData = async () => {
      // setIsLoading(true);
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
      // console.log("disconnected");
      setIsConnected(false);
    });
  }, [isConnected]);

  useEffect(() => {
    setAthleteNFTs([]);
    if (isConnected && router.isReady) {
      // // console.log("route in myteam:" + JSON.stringify(router.query, null, 2));
      setIsLoading(true);
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueRoute[0],
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      // const LeagueProxyContract = new ethers.Contract(
      //   router.query.leagueAddress,
      //   LeagueOfLegendsLogicJSON.abi,
      //   provider
      // );
      setLeagueProxyContract(LeagueProxyContract);

      // Initialize connections to Athlete datastore contract
      const AthleteContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Athletes,
        AthletesJSON.abi,
        provider
      );
      setAthleteContract(AthleteContract);

      async function fetchData() {
        setIsLoading(true);

        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);

        const isInLeague = await LeagueProxyContract.inLeague(connectedAccount);
        setIsLeagueMember(isInLeague);
        const currentWeekNum = await LeagueProxyContract.currentWeekNum();
        setCurrentWeekNum(currentWeekNum);

        let i = 0;
        let error = "none";
        do {
          await LeagueProxyContract.leagueMembers(i).catch((_error) => {
            error = _error;
            // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
            // console.log("User To League Map Error: " + _error.message);
          });

          if (error == "none") {
            i++;
          }
          // console.log("error value at end:" + error);
        } while (error == "none");
        const leagueSize = i;

        console.log("league size: " + leagueSize);
        let weekMatchups = [];
        weekMatchups = await LeagueProxyContract.getScheduleForWeek(
          currentWeekNum
        ).catch((_error) => {
          // error = _error;
          alert("Error! : " + JSON.stringify(error, null, 2));
          // console.log("User To League Map Error: " + _error.message);
        });

        const shifter = 4 - Math.round(leagueSize / 2);
        console.log("shifter size: " + shifter);

        weekMatchups = weekMatchups.slice(shifter);
        weekMatchups.map((matchup, index) => {
          console.log("matchup #" + index + ": " + matchup);
        });

        const starterIds = [null, null, null, null, null];
        for (let i = 0; i <= 4; i++) {
          const id = await LeagueProxyContract.userToLineup(
            connectedAccount,
            i
          ).catch((e) => console.log("error: " + e));
          starterIds[i] = id;
        }
        setStarterAthleteIds(starterIds);
        // This ussually takes the longest, so set isLoading to false here
        setIsLoading(false);

        // TODO if is not league member, refresh the page
        if (!isInLeague) {
          router.push("/leagues/" + router.query.leagueRoute[0]);
        }
      }
      // declare the async data fetching function
      const getNFTData = async () => {
        setIsLoading(true);
        const web3 = createAlchemyWeb3(constants.RINKEBY_ALCHEMY_LINK);

        const nfts = await web3.alchemy.getNfts({
          owner: connectedAccount,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        });

        setNFTResp(nfts);
        const athleteMetadata = [];

        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: CONTRACT_ADDRESSES.GameItems,
            tokenId: token,
          });
          // console.log(
          //   "Token #" +
          //     token +
          //     " metadata: " +
          //     JSON.stringify(response, null, 2)
          // );
          if (!response.title?.includes("Pack")) {
            athleteMetadata[parseInt(token)] = response.metadata;
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
          }
          // setIsLoading(false);
        }
        setOwnedAthletesMetadata(athleteMetadata);

        // athleteMetadata.forEach((athlete, index) => {
        //   if (index == 0)
        //     // console.log(
        //       "athlete id #" + index + ": " + JSON.stringify(athlete, null, 2)
        //     );
        // });
      };

      // function to loop through and get league schedule
      async function getLeagueSchedule() {
        // let i = 0;
        // let error = "none";

        // // Continue to add leagues to activeLEagueList and pendingLeagueList
        // // until we hit an error (because i is out of range presumably)
        // do {
        let matchup = [];
        matchup = await leagueProxyContract
          .getScheduleForWeek(currentWeekNum)
          .catch((_error) => {
            // error = _error;
            alert("Error! : " + JSON.stringify(error, null, 2));
            // console.log("User To League Map Error: " + _error.message);
          });

        matchup.map((matchup, index) => {
          console.log("matchup #" + index + ": " + matchup);
        });

        // if (error == "none") {
        //   i++;

        // }
        // console.log("error value at end:" + error);
        // } while (error == "none");
      }

      getNFTData().catch((error) => {
        // console.log("fetch NFT DATA error: " + error);
      });

      fetchData();
      // getStarterAthleteData(starterAthleteIds);
    } else {
      // alert("no account data or league Address found, please refresh.");
      // console.log("no account data or league Address found");
      // // console.log("router: " + JSON.stringify(router.query, null, 2));
      //   // console.log("leagueAddress: " + leagueAddress);
    }
  }, [isConnected, router.isReady, connectedAccount]);

  useEffect(() => {
    // // console.log("isLoading: " + isLoading);
    if (starterAthleteIds) {
      getStarterAthleteData();
      // setCurrentPositionIndex(1);
      // // console.log(
      //   "get filter:" + JSON.stringify(getFilteredOwnedAthletes(), null, 2)
      // );
    }
  }, [starterAthleteIds]);

  const getStarterAthleteData = async () => {
    // console.log("starterID: " + starterAthleteIds);
    starterAthleteIds.forEach(async (id, index) => {
      if (id != 0) {
        const score = await athleteContract
          .athleteToScores(id, currentWeekNum)
          .catch((error) => {
            alert("error: " + JSON.stringify(error, null, 2));
            // score = null;
          });
        // // console.log("prevpoints: " + score);
        ownedAthletesMetadata[id].score = score;
      } else if (id != 0) {
        ownedAthletesMetadata[id].score = "n/a";
      }
    });
  };

  const handleModalOpen = (athelete) => {
    setCurrentPlayer(athelete);
    setModalOpen(true);
  };

  const handleStateModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      {isLoading ? (
        <LoadingPrompt loading={"Your Matchup"} />
      ) : (
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            color="white"
            component="div"
            sx={{
              fontSize: "64px",
            }}
          >
            {leagueName}
          </Typography>
          <Typography
            color="white"
            sx={{
              fontSize: "36px",
            }}
          >
            {"Week #" +
              currentWeekNum +
              (isLineupLocked
                ? ": Rosters unlock in " + daysTillUnlock + " Days"
                : ": Rosters Locks in " + daysTillLock + " Days")}{" "}
          </Typography>
          <Box
            sx={{
              background: "#473D3D",
              borderRadius: "16px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography color={"white"} fontSize={48}>
                  reggiecai.eth
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography color={"white"} fontSize={64} fontWeight="700">
                    3
                  </Typography>
                  <Image
                    src={LogoIcon}
                    alt="logo image"
                    width={62}
                    height={62}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography color={"white"} fontSize={48}>
                  willhunter.eth
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography color={"white"} fontSize={64} fontWeight="700">
                    2
                  </Typography>
                  <Image
                    src={LogoIcon}
                    alt="logo image"
                    width={62}
                    height={62}
                  />
                </Box>
              </Box>
            </Box>
            <Grid>
              {starterAthleteIds.map((id, index) => {
                // const athelete = atheleteData[key];
                // NOTE: if id == 0, that means the connectedAccount has not
                // set an athlete in that position for this week in their proxy
                const athlete = ownedAthletesMetadata[id];
                // console.log(
                //   "id: " + id + " athlete: " + JSON.stringify(athlete, null, 2)
                // );
                return (
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "white",
                      borderTop: "2px solid #FFFFFF",
                    }}
                  >
                    <Grid item xs={1} textAlign="center">
                      <Image
                        src={id != 0 ? athlete.image : logo}
                        alt="logo"
                        width={50}
                        height={50}
                      />
                    </Grid>
                    <Grid
                      item
                      textAlign="center"
                      onClick={() => handleModalOpen(athlete)}
                      sx={{ cursor: "pointer" }}
                    >
                      <Typography fontSize={48}>
                        {id != 0 ? athlete.name : "none set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Typography fontSize={30} fontWeight={700}>
                        {id != 0 ? athlete.attributes[0].value : "no team"}
                      </Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Typography>Loss vs {"winners"}</Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Typography color="#D835D8" fontSize={48}>
                        {id != 0 && currentWeekNum != 0 ? athlete.score : "n/a"}{" "}
                      </Typography>
                    </Grid>
                    {/* middle column */}
                    <Grid item xs={1.5} textAlign="center">
                      <Typography
                        fontSize={48}
                        sx={{
                          borderLeft: "1px solid #FFFFFF",
                          borderRight: "1px solid #FFFFFF",
                        }}
                      >
                        {positions[index]}
                      </Typography>
                    </Grid>
                    {/* opponents athlete stats */}
                    <Grid item xs={1} textAlign="center">
                      <Typography color="#D835D8" fontSize={48}>
                        {id != 0 && currentWeekNum != 0 ? athlete.score : "n/a"}{" "}
                      </Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Typography>Loss vs {"OPPONENT"}</Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Typography fontSize={30} fontWeight={700}>
                        {id != 0 ? athlete.attributes[0].value : "no team"}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      textAlign="center"
                      onClick={() => handleModalOpen(athlete)}
                      sx={{ cursor: "pointer" }}
                    >
                      <Typography fontSize={48}>
                        {id != 0 ? athlete.name : "none set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={1} textAlign="center">
                      <Image
                        src={id != 0 ? athlete.image : logo}
                        alt="logo"
                        width={50}
                        height={50}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          <PlayerStateModal
            modalOpen={modalOpen}
            stateData={statsData}
            handleModalClose={handleStateModalClose}
          />
        </Container>
      )}
    </>
  );
}
