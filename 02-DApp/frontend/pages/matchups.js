import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Typography
} from "@mui/material";

// Web3 Imports
import axios from "axios";
import axiosRetry from "axios-retry";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesMatic.js";
import AthletesJSON from "../../backend/contractscripts/contract_info/maticAbis/Athletes.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json";
import logo from "../assets/images/mystery_card.png";
import LoadingPrompt from "../components/LoadingPrompt.js";
import PlayerStateModal from "../components/PlayerStateModal";
import AthletesToIndex from "../constants/AlthletesToIndex.json";
// todo
// const statsData = Sample.statsData;

export default function Matchups({ daysTillLock, daysTillUnlock }) {
  // Router params
  const router = useRouter();
  // TODO change to matic network for prod
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
  );

  // Web2 endpoints
  const playerStatsApi = axios.create({
    baseURL: "https://teamdiff-backend-api.vercel.app/api",
  });
  playerStatsApi.defaults.baseURL =
    "https://teamdiff-backend-api.vercel.app/api";

  axiosRetry(playerStatsApi, {
    retries: 2,
    retryDelay: (count) => {
      console.log("retrying player stat api call: " + count);
      return count * 1000;
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(false);
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [currentWeekNum, setCurrentWeekNum] = useState();
  //   const [leagueAddress, setLeagueAddress] = useState(router.query.leagueAddress);
  // const [isLeagueMember, setIsLeagueMember] = useState(false);
  // const [stateModalOpen, setStateModalOpen] = useState(false);
  // const [subModalOpen, setSubModalOpen] = useState(false);
  // const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [competitor1StarterAthleteIds, setCompetitor1StarterAthleteIds] =
    useState([]);
  const [competitor2StarterAthleteIds, setCompetitor2StarterAthleteIds] =
    useState([]);
  const [competitor1StarterAthleteScores, setCompetitor1StarterAthleteScores] =
    useState([-1, -1, -1, -1, -1]);
  const [competitor2StarterAthleteScores, setCompetitor2StarterAthleteScores] =
    useState([-1, -1, -1, -1, -1]);
  // const [athleteNFTs, setAthleteNFTs] = useState([]);
  // const [nftResp, setNFTResp] = useState(null);
  const [leagueScheduleIsSet, setLeagueScheduleIsSet] = useState();
  // const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);
  const [athleteContract, setAthleteContract] = useState();
  // const [
  //   competitor1OwnedAthletesMetadata,
  //   setCompetitor1OwnedAthletesMetadata,
  // ] = useState([]);
  // const [
  //   competitor2OwnedAthletesMetadata,
  //   setCompetitor2OwnedAthletesMetadata,
  // ] = useState([]);
  const [isLineupLocked, setIsLineupLocked] = useState();
  const [selectedWeekMatchups, setSelectedWeekMatchups] = useState();
  const [selectedMatchup, setSelectedMatchup] = useState(0);
  // const [competitor1WeekScore, setCompetitor1WeekScore] = useState();
  // const [competitor2WeekScore, setCompetitor2WeekScore] = useState();
  const [competitor1TeamScore, setCompetitor1TeamScore] = useState(0);
  const [competitor2TeamScore, setCompetitor2TeamScore] = useState(0);
  const [isError, setIsError] = useState(false);
  const [hasFetchedComp1Scores, setHasFetchedComp1Scores] = useState(false);
  const [hasFetchedComp2Scores, setHasFetchedComp2Scores] = useState(false);
  const [leagueSize, setLeagueSize] = useState();
  const positions = ["ADC", "Jungle", "Mid", "Support", "Top"];
  let shifter = 0;
  // let leagueSize = 0;

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
        // setSigner(signer);
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
    // setAthleteNFTs([]);
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
        // setIsLeagueMember(isInLeague);

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
        setLeagueSize(leagueSize);
        // console.log("size: " + leagueSize);

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
            getSelectedMatchupStarterIds(weekMatchups, LeagueProxyContract);
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

      fetchData();
    }
  }, [isConnected, router.isReady, connectedAccount]);

  const getSelectedMatchupStarterIds = async (
    weekMatchups,
    LeagueProxyContract
  ) => {
    // Get starter athlete ids for both competitors of currently viewed matchup of currenlty selected week
    for (let j = 0; j <= 1; j++) {
      const starterIds = [];
      let competitorAccount;
      j == 0
        ? (competitorAccount = weekMatchups[selectedMatchup][0][0])
        : (competitorAccount = weekMatchups[selectedMatchup][0][1]);
      // console.log("competitor addy: " + competitorAccount + "\n\tj: " + j);

      // If playing bye week, set starter ids to  null
      if (
        competitorAccount == "0x0000000000000000000000000000000000000000" &&
        j == 0
      )
        setCompetitor1StarterAthleteIds([100, 100, 100, 100, 100]);
      else if (
        competitorAccount == "0x0000000000000000000000000000000000000000" &&
        j == 1
      ) {
        setCompetitor2StarterAthleteIds([100, 100, 100, 100, 100]);
        // console.log("setting comp1 to 100");
        // break;
        // 0x0000000000000000000000000000000000000000
      } else {
        for (let i = 0; i <= 4; i++) {
          const id = await LeagueProxyContract.userToLineup(
            competitorAccount,
            i
          ).catch((e) => {
            console.error("userToLineup error: " + e);
            setIsError(true);
          });
          // TODO this will return 100 if starter is not set for position,
          starterIds[i] = id;
        }
        // console.log("starter id: " + starterIds + " \n\tj: " + j);
        j == 0
          ? setCompetitor1StarterAthleteIds(starterIds)
          : setCompetitor2StarterAthleteIds(starterIds);
      }
    }
  };

  // UseEffect that grabs the line up starter ids for the currently viewed matchup
  useEffect(() => {
    if (selectedWeekMatchups && leagueScheduleIsSet) {
      // Lowkeyy we don't need to pull this from contract, rather just do it from backend
      const getNFTData = async () => {
        setIsLoading(true);
        await getSelectedMatchupStarterIds(
          selectedWeekMatchups,
          leagueProxyContract
        );
        console.log("got selected matchupstarterids");
        setIsLoading(false);
      };
      getNFTData();
    }
  }, [selectedWeekMatchups, selectedMatchup, leagueScheduleIsSet]);

  // UseEffect to fetch the athlete scores on a change in competitorSTarterIds state var
  useEffect(() => {
    if (!isLoading) {
      // setHasFetchedComp1Scores(false);
      // setHasFetchedComp2Scores(false);
      // setCompetitor1TeamScore(0);
      // setCompetitor2TeamScore(0);
      const fetchData = async () => {
        await getStarterAthleteScores();
        // console.log("calculating matchup score");
        // await calculateMatchupScore();
      };
      fetchData();
    }
  }, [isLoading]);

  useEffect(() => {
    // setCompetitor1TeamScore(0);
    // setCompetitor2TeamScore(0);
    if (hasFetchedComp1Scores && hasFetchedComp2Scores) {
      //     setCompetitor1TeamScore(0);
      // setCompetitor2TeamScore(0);
      const fetchData = async () => {
        // await getStarterAthleteScores();
        // console.log("calculating matchup score");
        await calculateMatchupScore();
      };
      fetchData();
    }
  }, [
    hasFetchedComp1Scores,
    hasFetchedComp2Scores,
    competitor1StarterAthleteIds,
    competitor2StarterAthleteIds,
  ]);

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

  const getStarterAthleteScores = async () => {
    setHasFetchedComp1Scores(false);
    setHasFetchedComp2Scores(false);
    const { data } = await playerStatsApi.get(`/allAthletes/${currentWeekNum}`);
    // Create scores array for competitor 1 starter athletes
    const c1Scores = [-1, -1, -1, -1, -1];
    let score;

    // const c1Scores = competitor1StarterAthleteScores;
    competitor1StarterAthleteIds.forEach(async (id, index) => {
      if (id != 100) {
        // TODO if id #-1 is passed in, return -1
        const athleteData = data.find((element) => element.id == id);
        score = athleteData.points;
        // console.log("score for id#" + id + ": " + score);
        c1Scores[index] = score;
      }
      // if(score)
      // this if statement should always evaulate eventually
      if (index == 4) {
        setCompetitor1StarterAthleteScores(c1Scores);
        setHasFetchedComp1Scores(true);
      }
    });

    const c2Scores = [-1, -1, -1, -1, -1];
    // const c2Scores = competitor2StarterAthleteScores;
    // let score;
    competitor2StarterAthleteIds.forEach(async (id, index) => {
      if (id != 100) {
        // TODO if id #-1 is passed in, return -1
        const athleteData = data.find((element) => element.id == id);
        score = athleteData.points;
        // console.log("score for id#" + id + ": " + score);
        c2Scores[index] = score;
      }

      // this if statement should always evaulate eventual
      if (index == 4) {
        setCompetitor2StarterAthleteScores(c2Scores);
        setHasFetchedComp2Scores(true);
        // console.log("finsihed getting comp2 scores");
      }
    });
    // await calculateMatchupScore();
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

  const calculateMatchupScore = () => {
    // console.log("calculating matchup score");

    setCompetitor1TeamScore(0);
    setCompetitor2TeamScore(0);
    let team1Counter = 0;
    let team2Counter = 0;
    for (let i = 0; i < 5; i++) {
      const starter1Score = competitor1StarterAthleteScores[i];
      const starter2Score = competitor2StarterAthleteScores[i];
      // console.log("c1 starter score: " + starter1Score);
      // console.log("c2 starter score: " + starter2Score);
      if (starter1Score > starter2Score) {
        team1Counter++;
        // console.log("c1 score " + )
      } else if (starter2Score > starter1Score) team2Counter++;
    }
    // console.log("team1 counters" + team1Counter);
    setCompetitor1TeamScore(team1Counter);
    setCompetitor2TeamScore(team2Counter);
  };

  function getAthleteImage(id) {
    const athleteName = AthletesToIndex[id];
    return `/cards/${athleteName}.png`;
  }

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
                <Container
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {selectedMatchup > 0 && (
                    <AiOutlineArrowLeft
                      size={"1.5rem"}
                      onClick={() =>
                        setSelectedMatchup(
                          (selectedMatchup) => selectedMatchup - 1
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <Typography fontSize={30}>
                    Matchup #{selectedMatchup + 1}
                  </Typography>
                  {selectedMatchup + 2 < leagueSize && (
                    <AiOutlineArrowRight
                      size={"1.5rem"}
                      onClick={() =>
                        setSelectedMatchup(
                          (selectedMatchup) => selectedMatchup + 1
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </Container>
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
                      // if (competitor1StarterId != 100)
                      // console.log(
                      //   "c2 starter ids: " + competitor2StarterAthleteIds
                      // );
                      const competitor1Athlete =
                        AthletesToIndex[competitor1StarterId];
                      // const competitor1Athlete =
                      //   competitor1OwnedAthletesMetadata[competitor1StarterId];

                      // get athlete for competitor 2 at this position
                      const competitor2StarterId =
                        competitor2StarterAthleteIds[index];
                      const competitor2Athlete =
                        AthletesToIndex[competitor2StarterId];
                      // const competitor2Athlete =
                      //   competitor2OwnedAthletesMetadata[competitor2StarterId];
                      // if (competitor2StarterId != 100) {
                      //   console.log(
                      //     "id: " +
                      //       competitor2StarterId +
                      //       " athlete: " +
                      //       JSON.stringify(competitor2Athlete, null, 2)
                      //   );
                      // }
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
                                competitor1StarterId != 100
                                  ? getAthleteImage(competitor1StarterId)
                                  : // ? competitor1Athlete?.image
                                    logo
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
                              {competitor1StarterId != 100
                                ? competitor1Athlete
                                : // ? competitor1Athlete?.name
                                  "(none)"}
                            </Typography>
                          </Grid>
                          {/* <Grid item xs={1} textAlign="center">
                          <Typography fontSize={30} fontWeight={700}>
                            {competitor1StarterId != 100 &&
                              competitor1Athlete?.attributes[0].value}
                          </Typography>
                        </Grid> */}
                          <Grid item xs={1} textAlign="center">
                            <Typography>
                              {competitor1StarterId != 100 &&
                                "Loss vs **backend**"}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Typography color="#D835D8" fontSize={48}>
                              {competitor1StarterId != 100
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
                              {competitor2StarterId != 100
                                ? String(competitor2StarterAthleteScores[index])
                                : "(0)"}{" "}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Typography>
                              {competitor2StarterId != 100 &&
                                "Loss vs **backend**"}
                            </Typography>
                          </Grid>
                          {/* <Grid item xs={1} textAlign="center">
                          <Typography fontSize={30} fontWeight={700}>
                            {competitor2StarterId != 100 &&
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
                              {competitor2StarterId != 100
                                ? competitor2Athlete
                                : "(none)"}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} textAlign="center">
                            <Image
                              src={
                                competitor2StarterId != 100
                                  ? getAthleteImage(competitor2StarterId)
                                  : // ? competitor2Athlete?.image
                                    logo
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography textAlign="center">
                      {" "}
                      Fetching scores{" "}
                    </Typography>
                    <CircularProgress></CircularProgress>
                  </Box>
                )}
              </Box>
              <PlayerStateModal
                modalOpen={modalOpen}
                playerName={currentPlayer}
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
