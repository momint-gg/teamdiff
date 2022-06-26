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
import logo from "../assets/images/mystery_card.png";
import LoadingPrompt from "../components/LoadingPrompt.js";
import PlayerStateModal from "../components/PlayerStateModal";
import constants from "../constants/index.js";

// todo
const statsData = Sample.statsData;

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
  const [competitor1StarterAthleteIds, setCompetitor1StarterAthleteIds] =
    useState([]);
  const [competitor2StarterAthleteIds, setCompetitor2StarterAthleteIds] =
    useState([]);
  const [competitor1StarterAthleteScores, setCompetitor1StarterAthleteScores] =
    useState([-1, -1, -1, -1, -1]);
  const [competitor2StarterAthleteScores, setCompetitor2StarterAthleteScores] =
    useState([-1, -1, -1, -1, -1]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [nftResp, setNFTResp] = useState(null);
  const [leagueScheduleIsSet, setLeagueScheduleIsSet] = useState();
  // const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);
  const [athleteContract, setAthleteContract] = useState();
  const [
    competitor1OwnedAthletesMetadata,
    setCompetitor1OwnedAthletesMetadata,
  ] = useState([]);
  const [
    competitor2OwnedAthletesMetadata,
    setCompetitor2OwnedAthletesMetadata,
  ] = useState([]);
  const [isLineupLocked, setIsLineupLocked] = useState();
  const [selectedWeekMatchups, setSelectedWeekMatchups] = useState();
  const [selectedMatchup, setSelectedMatchup] = useState(0);
  const [competitor1WeekScore, setCompetitor1WeekScore] = useState();
  const [competitor2WeekScore, setCompetitor2WeekScore] = useState();
  const [competitor1TeamScore, setCompetitor1TeamScore] = useState(0);
  const [competitor2TeamScore, setCompetitor2TeamScore] = useState(0);
  const [isError, setIsError] = useState(false);
  const [hasFetchedComp1Scores, setHasFetchedComp1Scores] = useState(false);
  const [hasFetchedComp2Scores, setHasFetchedComp2Scores] = useState(false);
  const positions = ["ADC", "Jungle", "Mid", "Support", "Top"];
  let shifter = 0;

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const setAccountData = async () => {
      // setIsLoading(true);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts().catch((e) => {
        console.error(e);
      });

      if (accounts.length > 0) {
        const accountAddress = await signer.getAddress().catch((e) => {
          console.error(e);
        });
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
      setHasFetchedComp1Scores(false);
      setHasFetchedComp2Scores(false);
      // setHasFetchedComp1Scores(false);

      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueRoute[0],
        LeagueOfLegendsLogicJSON.abi,
        provider
      );

      setLeagueProxyContract(LeagueProxyContract);

      // Initialize connections to Athlete datastore contract
      const AthleteContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Athletes,
        AthletesJSON.abi,
        provider
      );
      setAthleteContract(AthleteContract);
      let weekMatchups = [];

      async function fetchData() {
        setIsLoading(true);

        const leagueName = await LeagueProxyContract.leagueName().catch((e) => {
          console.error(e);
          setIsLoading(false);
          setIsError(true);
        });
        setLeagueName(leagueName);

        const isInLeague = await LeagueProxyContract.inLeague(
          connectedAccount
        ).catch((e) => {
          console.error(e);
          setIsLoading(false);
          setIsError(true);
        });
        setIsLeagueMember(isInLeague);

        const currentWeekNum = await LeagueProxyContract.currentWeekNum().catch(
          (e) => {
            console.error(e);
            setIsLoading(false);
            setIsError(true);
          }
        );
        setCurrentWeekNum(currentWeekNum);

        // Get league size
        const leagueSize = await getLeagueSizeHelper(LeagueProxyContract);

        // Get selected weeks matchups from league proxy schedule
        weekMatchups = await LeagueProxyContract.getScheduleForWeek(
          currentWeekNum
        ).catch((e) => {
          console.error("get schedule for week error: " + e);
          setIsLoading(false);
          setIsError(true);
        });
        // Slice array, by finding how many slots in return weekMatchups array to skip (due to setLeagueSchedule algorithm)
        shifter = 4 - Math.round(leagueSize / 2);
        if (weekMatchups) {
          weekMatchups = weekMatchups.slice(shifter);
          // weekMatchups.map((matchup, index) => {
          //   console.log("matchup #" + index + ": " + matchup);
          // });
          setSelectedWeekMatchups(weekMatchups);

          // TODO
          // Get final scores for each competitor
          // const competitor1Score = LeagueProxyContract.get;

          if (weekMatchups.length > 0) {
            setLeagueScheduleIsSet(true);

            // Get starter athlete ids for both competitors of currently viewed matchup of currenlty selected week
            for (let j = 0; j <= 1; j++) {
              const starterIds = [];
              // const comp = [-1, -1, -1, -1, -1];
              let competitorAccount;
              j == 0
                ? (competitorAccount = weekMatchups[selectedMatchup][0][0])
                : (competitorAccount = weekMatchups[selectedMatchup][0][1]);
              for (let i = 0; i <= 4; i++) {
                const id = await LeagueProxyContract.userToLineup(
                  competitorAccount,
                  i
                ).catch((e) => {
                  console.error("userToLineup error: " + e);
                  setIsError(true);
                });
                // TODO this will return 0 if starter is not set for position,
                // but sometimes we want that if a user sets athlete id #0, init all startEr ids to be -1 in contract
                starterIds[i] = id;
              }
              j == 0
                ? setCompetitor1StarterAthleteIds(starterIds)
                : setCompetitor2StarterAthleteIds(starterIds);
              // let scores;
              // const fetchData = async () => {
              //   if (starterIds != comp && AthleteContract) {
              //     console.log("in if statement: " + starterIds);
              //     scores = await getStarterAthleteData(
              //       starterIds,
              //       AthleteContract
              //     );
              //     console.log("setting state scores to " + scores);
              //     if (scores) setCompetitor1StarterAthleteScores(scores);
              //     // await calculateMatchupScore();
              //   }
              // };
              // fetchData();
            }
          } else {
            console.log("leagueSchedule not set");
            setLeagueScheduleIsSet(false);
          }
        }
        // This ussually takes the longest, so set isLoading to false here
        setIsLoading(false);

        // TODO if is not league member, refresh the page
        if (!isInLeague) {
          router.push("/leagues/" + router.query.leagueRoute[0]);
        }
      }

      // function to loop through and get league schedule (not used rn)
      // async function getLeagueSchedule() {
      //   let i = 0;
      //   let error = "none";
      //   do {
      //     await leagueProxyContract.leagueMembers(i).catch((_error) => {
      //       error = _error;
      //       // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
      //       // console.log("User To League Map Error: " + _error.message);
      //     });

      //     if (error == "none") {
      //       i++;
      //     }
      //     // console.log("error value at end:" + error);
      //   } while (error == "none");
      //   const leagueSize = i;

      //   console.log("league size: " + leagueSize);
      //   let weekMatchups = [];
      //   weekMatchups = await leagueProxyContract
      //     .getScheduleForWeek(currentWeekNum)
      //     .catch((_error) => {
      //       // error = _error;
      //       alert("Error! : " + JSON.stringify(error, null, 2));
      //       // console.log("User To League Map Error: " + _error.message);
      //     });

      //   const shifter = 4 - Math.round(leagueSize / 2);
      //   // console.log("shifter size: " + shifter);

      //   weekMatchups = weekMatchups.slice(shifter);
      //   // weekMatchups.map((matchup, index) => {
      //   //   console.log("matchup #" + index + ": " + matchup);
      //   // });

      //   setSelectedWeekMatchups(weekMatchups);
      // }

      fetchData();
    }
  }, [isConnected, router.isReady, connectedAccount]);

  useEffect(() => {
    if (selectedWeekMatchups && leagueScheduleIsSet) {
      const getNFTData = async () => {
        setIsLoading(true);
        const web3 = createAlchemyWeb3(constants.RINKEBY_ALCHEMY_LINK);
        // console.log(
        //   "slected week matchups: " +
        //     JSON.stringify(selectedWeekMatchups, null, 2)
        // );
        for (let i = 0; i <= 1; i++) {
          let nfts;
          i == 0
            ? (nfts = await web3.alchemy
                .getNfts({
                  owner: selectedWeekMatchups[selectedMatchup][0][0],
                  contractAddresses: [CONTRACT_ADDRESSES.GameItems],
                })
                .catch((e) => {
                  console.error("getNfts error: " + e);
                  setIsLoading(false);
                  setIsError(true);
                }))
            : (nfts = await web3.alchemy
                .getNfts({
                  owner: selectedWeekMatchups[selectedMatchup][0][1],
                  contractAddresses: [CONTRACT_ADDRESSES.GameItems],
                })
                .catch((e) => {
                  console.error("getNfts error: " + e);
                  setIsLoading(false);
                  setIsError(true);
                }));

          setNFTResp(nfts);
          const athleteMetadata = [];

          for (const nft of nfts?.ownedNfts) {
            const token = nft?.id?.tokenId;
            const response = await web3.alchemy
              .getNftMetadata({
                contractAddress: CONTRACT_ADDRESSES.GameItems,
                tokenId: token,
              })
              .catch((e) => {
                console.error("getNftMetadata error: " + e);
                setIsLoading(false);
                setIsError(true);
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
          i == 0
            ? setCompetitor1OwnedAthletesMetadata(athleteMetadata)
            : setCompetitor2OwnedAthletesMetadata(athleteMetadata);
        }
        competitor1OwnedAthletesMetadata.forEach((athlete, index) => {
          if (index == 0)
            console.log(
              "athlete id #" + index + ": " + JSON.stringify(athlete, null, 2)
            );
        });
        // setIsLoading(false);
      };
      getNFTData();
      // .catch((error) => {
      //   alert("fetch NFT DATA error: " + error);
      // });
    }
  }, [selectedWeekMatchups, leagueScheduleIsSet]);

  // UseEffect to fetch the athlete scores on a change in competitorSTarterIds state var
  useEffect(() => {
    if (
      // competitor1StarterAthleteIds &&
      // competitor2StarterAthleteIds
      !isLoading
    ) {
      // setIsLoading(true);
      // console.log("getting the data from use effect");
      // let scores;
      const fetchData = async () => {
        await getStarterAthleteData();
      };
      fetchData();
    }
  }, [isLoading]);
  // }, [competitor1StarterAthleteIds, competitor2StarterAthleteIds]);

  const getLeagueSizeHelper = async (LeagueProxyContract) => {
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
    return i;
  };

  const getStarterAthleteData = async () => {
    // Create scores array for competitor 1 starter athletes
    const c1Scores = competitor1StarterAthleteScores;
    let score;
    competitor1StarterAthleteIds.forEach(async (id, index) => {
      // if (id != -1) {
      // TODO if id #-1 is passed in, return -1
      score = await athleteContract
        .athleteToScores(id, currentWeekNum)
        .catch((error) => {
          console.log(
            "Athlete to Scores1 Error: " + JSON.stringify(error, null, 2)
          );
          // score = null;
        });
      // this if statement should always evaulate eventually
      if (index == 4) {
        // if (index == competitor1StarterAthleteIds.length - 1) {
        // console.log(
        //   "index: " + index + ", length: " + competitor1StarterAthleteIds.length
        // );
        // console.log("last element in loop, retunring val");
        setCompetitor1StarterAthleteScores(c1Scores);
        setHasFetchedComp1Scores(true);
        // return c1Scores;
      }
      // }
      // console.log("score for id#" + id + ": " + score);
      // only update array if score is not defualt value
      if (score != -1) c1Scores[index] = score;
    });

    // Create scores array for competitor 1 starter athletes
    const c2Scores = competitor2StarterAthleteScores;
    // let score;
    competitor2StarterAthleteIds.forEach(async (id, index) => {
      // if (id != -1) {
      // TODO if id #-1 is passed in, return -1
      score = await athleteContract
        .athleteToScores(id, currentWeekNum)
        .catch((error) => {
          console.log(
            "Athlete to Scores1 Error: " + JSON.stringify(error, null, 2)
          );
          // score = null;
        });
      // this if statement should always evaulate eventually
      if (index == 4) {
        // if (index == competitor1StarterAthleteIds.length - 1) {
        // console.log(
        //   "index: " + index + ", length: " + competitor1StarterAthleteIds.length
        // );
        // console.log("last element in loop, retunring val");
        setCompetitor2StarterAthleteScores(c2Scores);
        // Todo, break this into two state hooks, one for compettiro 1 and one for the other
        setHasFetchedComp2Scores(true);
        // return c2Scores;
      }
      // }
      // console.log("score for id#" + id + ": " + score);
      // only update array if score is not defualt value
      if (score != -1) c2Scores[index] = score;
    });
  };

  const handleModalOpen = (athelete) => {
    setCurrentPlayer(athelete);
    setModalOpen(true);
  };

  const handleStateModalClose = () => {
    setModalOpen(false);
  };

  const shortenAddress = (address) => {
    // console.log("address to shorten: " + address);
    const shortenedAddress1 = `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
    return shortenedAddress1;
    // setIsConnected(true);
  };

  // const calculateMatchupScore = () => {
  //   let team1Counter = 0;
  //   let team2Counter = 0;
  //   for (let i = 0; i < 5; i < 0) {
  //     const starter1Score = competitor1StarterAthleteScores[i];
  //     const starter2Score = competitor2StarterAthleteScores[i];
  //     if (starter1Score > starter2Score) team1Counter++;
  //     else if (starter2Score > starter1Score) team2Counter++;
  //   }
  //   setCompetitor1TeamScore(team1Counter);
  //   setCompetitor2TeamScore(team2Counter);
  // };

  return (
    <>
      {isError && (
        <Typography textAlign="center">
          {" "}
          Oops! We encountered an error when loading you league stats. Please
          cheeck your internet connections and try again.
        </Typography>
      )}
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
          {leagueScheduleIsSet ? (
            <>
              <Box
                sx={{
                  background: "#473D3D",
                  borderRadius: "16px",
                  width: "85vw",
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
                      {/* idk what the first zero is for, but otherwise it is undefined, second 0 controls which player in matchup */}
                      {shortenAddress(
                        selectedWeekMatchups[selectedMatchup][0][0]
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        color={"white"}
                        fontSize={64}
                        fontWeight="700"
                      >
                        {competitor1TeamScore}
                      </Typography>
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
                      {shortenAddress(
                        selectedWeekMatchups[selectedMatchup][0][1]
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        color={"white"}
                        fontSize={64}
                        fontWeight="700"
                      >
                        {competitor2TeamScore}
                      </Typography>
                      {/* <Image
                    src={LogoIcon}
                    alt="logo image"
                    width={62}
                    height={62}
                  /> */}
                    </Box>
                  </Box>
                </Box>
                {hasFetchedComp1Scores && hasFetchedComp2Scores ? (
                  <Grid>
                    {positions.map((position, index) => {
                      // const athelete = atheleteData[key];
                      // NOTE: if id == 0, that means the connectedAccount has not
                      // set an athlete in that position for this week in their proxy

                      // get athlete for competitor 1 at this position
                      const competitor1StarterId =
                        competitor1StarterAthleteIds[index];
                      if (competitor1StarterId != 0)
                        console.log(
                          "c1 starter score: " + competitor1StarterAthleteScores
                        );
                      const competitor1Athlete =
                        competitor1OwnedAthletesMetadata[competitor1StarterId];

                      // get athlete for competitor 2 at this position
                      const competitor2StarterId =
                        competitor2StarterAthleteIds[index];
                      const competitor2Athlete =
                        competitor2OwnedAthletesMetadata[competitor2StarterId];
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
                              src={
                                competitor1StarterId != 0
                                  ? competitor1Athlete?.image
                                  : logo
                              }
                              alt="logo"
                              width={50}
                              height={50}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={2}
                            textAlign="left"
                            onClick={() => handleModalOpen(competitor1Athlete)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Typography fontSize={34}>
                              {competitor1StarterId != 0
                                ? competitor1Athlete?.name
                                : "(none)"}
                            </Typography>
                          </Grid>
                          {/* <Grid item xs={1} textAlign="center">
                          <Typography fontSize={30} fontWeight={700}>
                            {competitor1StarterId != 0 &&
                              competitor1Athlete?.attributes[0].value}
                          </Typography>
                        </Grid> */}
                          <Grid item xs={1} textAlign="center">
                            <Typography>
                              {competitor1StarterId != 0 &&
                                "Loss vs **backend**"}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Typography color="#D835D8" fontSize={48}>
                              {competitor1StarterId != 0
                                ? String(competitor1StarterAthleteScores[index])
                                : "(0)"}{" "}
                            </Typography>
                          </Grid>
                          {/* middle column */}
                          <Grid item xs={2} textAlign="center">
                            <Typography
                              fontSize={42}
                              sx={{
                                borderLeft: "1px solid #FFFFFF",
                                borderRight: "1px solid #FFFFFF",
                                fontWeight: "bold",
                              }}
                            >
                              {position}
                            </Typography>
                          </Grid>
                          {/* opponents athlete stats */}
                          <Grid item xs={1} textAlign="center">
                            <Typography color="#D835D8" fontSize={48}>
                              {competitor2StarterId != 0
                                ? String(competitor2StarterAthleteScores[index])
                                : "(0)"}{" "}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Typography>
                              {competitor2StarterId != 0 &&
                                "Loss vs **backend**"}
                            </Typography>
                          </Grid>
                          {/* <Grid item xs={1} textAlign="center">
                          <Typography fontSize={30} fontWeight={700}>
                            {competitor2StarterId != 0 &&
                              competitor2Athlete?.attributes[0].value}
                          </Typography>
                        </Grid> */}
                          <Grid
                            item
                            xs={2}
                            textAlign="right"
                            onClick={() => handleModalOpen(competitor2Athlete)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Typography fontSize={34}>
                              {competitor2StarterId != 0
                                ? competitor2Athlete?.name
                                : "(none)"}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Image
                              src={
                                competitor2StarterId != 0
                                  ? competitor2Athlete?.image
                                  : logo
                              }
                              alt="logo"
                              width={50}
                              height={50}
                            />
                          </Grid>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography> fetching scores</Typography>
                )}
              </Box>
              <PlayerStateModal
                modalOpen={modalOpen}
                stateData={statsData}
                handleModalClose={handleStateModalClose}
              />
            </>
          ) : (
            <Typography textAlign={"center"} color="primary">
              Oops! Your league's schedule has not been set yet. Please request
              help in Discord if this issue persists past the end of the week.
            </Typography>
          )}
        </Container>
      )}
    </>
  );
}
