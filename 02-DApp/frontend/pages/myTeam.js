import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { makeStyles } from "@material-ui/core";
import {
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import AthletesJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/Athletes.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import logo from "../assets/images/mystery_card.png";
import LoadingPrompt from "../components/LoadingPrompt.js";
import PlayerSelectModal from "../components/PlayerSelectModal";
import PlayerStateModal from "../components/PlayerStateModal";
import constants from "../constants";

// TODO get data from backend

export default function MyTeam() {
  // Router params
  const router = useRouter();
  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const useStyles = makeStyles({
    cell: {
      fontSize: 36,
    },
  });
  const classes = useStyles();

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
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState();
  const [isLineupLocked, setIsLineupLocked] = useState();
  const [isSettingAthlete, setIsSettingAthlete] = useState();

  const positions = ["ADC", "Jungle", "Mid", "Support", "Top"];

  // DAte
  const d = new Date();
  const today = d.getDay() + 1;
  // Set to corresponding lock day Sun = 1, Sat = 7
  const leagueLockDay = 1;
  let daysTillLock;
  let daysTillUnlock;
  today > leagueLockDay
    ? // If today greater than lock day
      (daysTillLock = 7 - today + leagueLockDay)
    : // if today < lock day
      (daysTillLock = leagueLockDay - today);
  if (daysTillLock > 5) {
    daysTillUnlock = 7 - daysTillLock;
  }

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
      LeagueProxyContract.on("AthleteSetInLineup", athleteSetCallback);

      // Initialize connections to Athlete datastore contract
      const AthleteContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Athletes,
        AthletesJSON.abi,
        provider
      );
      setAthleteContract(AthleteContract);

      async function fetchData() {
        setIsLoading(true);

        const lineupIsLocked = await LeagueProxyContract.lineupIsLocked();
        setIsLineupLocked(lineupIsLocked);

        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        const isInLeague = await LeagueProxyContract.inLeague(connectedAccount);
        setIsLeagueMember(isInLeague);
        // TODO if is not league member, refresh the page
        if (!isInLeague) {
          router.push("/leagues/" + router.query.leagueRoute[0]);
        }
        const currentWeekNum = await LeagueProxyContract.currentWeekNum();
        setCurrentWeekNum(currentWeekNum);
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
      if (id != 100 && currentWeekNum > 0) {
        const prevPoints = await athleteContract
          .athleteToScores(id, currentWeekNum - 1)
          .catch((error) => {
            // console.log(JSON.stringify(error, null, 2));
            // prevPoints = null;
          });
        // // console.log("prevpoints: " + prevPoints);
        ownedAthletesMetadata[id].prevPoints = prevPoints;
      } else if (id != 100) {
        ownedAthletesMetadata[id].prevPoints = "n/a";
      }
    });
    // ownedAthletesMetadata.forEach((athlete, index) => {
    //   if (index == 0)
    //     // console.log(
    //       "after getting prevPointsathlete id #" +
    //         index +
    //         ": " +
    //         JSON.stringify(athlete, null, 2)
    //     );
    // });
  };

  const getFilteredOwnedAthletes = () => {
    const result = [];
    ownedAthletesMetadata.map((athlete, index) => {
      // check if athlete has the currently selected positions
      if (athlete?.attributes[1].value == positions[currentPositionIndex]) {
        result[index] = athlete;
      }
    });
    return result;
  };

  const athleteSetCallback = async (sender, id, position) => {
    if (sender == connectedAccount) {
      setIsSettingAthlete(false);
      alert(
        "Successfully set Athlete id #" +
          id +
          " in posiiton: " +
          positions[position] +
          ". " +
          "\nPlease refresh to see changes."
      );
      // router.push()
    } else {
      console.log("event triggered but filtered");
    }
  };

  // TODO create a callback function for when athlete has been set in lineup
  const submitStarterHandler = async (athleteID, positionID) => {
    // const positions = ["Top", "Jungle", "Mid", "Laner", "Support"];
    // // const positionIndex = positionID;
    // console.log(
    //   "setting athlete id#" + athleteID + " at postion #" + positionID
    // );

    const leagueProxyContractWithSigner = leagueProxyContract.connect(signer);

    await leagueProxyContractWithSigner
      .setAthleteInLineup(athleteID, positionID)
      .then(() => {
        // console.log(
        //   "setting athlete id#" + athleteID + " at postion #" + positionID
        // )
        // update state to listen to callback for when position is set
        setIsSettingAthlete(true);
        setSubModalOpen(false);
      })
      .catch((error) => {
        if (error.data) {
          alert("Set Lineup error: " + error.data.message);
        } else {
          alert("error: " + error.message);
        }
      });
  };

  const handleStateModal = (player, positionIndex) => {
    setSelectedPlayer(player);
    // console.log("setting current player: " + JSON.stringify(player, null, 2));
    setCurrentPositionIndex(positionIndex);
    setStateModalOpen(true);
  };

  const handleSubModal = (player, positionIndex) => {
    setCurrentPositionIndex(positionIndex);
    setSelectedPlayer(player);

    // // console.log("setting pos: " + position);
    // console.log("setting current player: " + JSON.stringify(player, null, 2));

    setSubModalOpen(true);
  };

  const handleStateModalClose = () => {
    setStateModalOpen(false);
    setSubModalOpen(false);
  };

  return (
    <>
      {isLoading ? (
        <LoadingPrompt loading={"Your Team"} />
      ) : (
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isSettingAthlete && (
            <>
              <Typography>Updating line-up on-chain...</Typography>
              <CircularProgress></CircularProgress>
            </>
          )}
          <Container>
            <Button
              variant="contained"
              onClick={() =>
                router.push("/leagues/" + router.query.leagueRoute[0] + "/home")
              }
              size="small"
              // color="secondary"
              // filled
              style={{
                // background:
                //   "linear-gradient(135deg, #00FFFF 0%, #FF00FF 0.01%, #480D48 100%)",
                background: "#480D48",
                borderRadius: "30px",
                padding: "10px 40px",
                fontWeight: "200",
                fontSize: "15px",
                position: "absolute",
                left: "25px",
              }}
            >
              Back to league page
            </Button>
          </Container>
          <Typography
            variant="h4"
            color="white"
            component="div"
            sx={{
              fontSize: 64,
            }}
          >
            {leagueName}
          </Typography>
          <Typography
            color="white"
            component="div"
            sx={{
              fontSize: 36,
            }}
          >
            {"Week #" +
              currentWeekNum +
              (isLineupLocked
                ? ": Rosters unlock in " + daysTillUnlock + " Days"
                : ": Rosters Locks in " + daysTillLock + " Days")}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#473D3D" }}>
                  <TableCell className={classes.cell} align="center">
                    Position
                  </TableCell>
                  <TableCell align="center" className={classes.cell}>
                    Player
                  </TableCell>
                  <TableCell align="center" className={classes.cell}>
                    Last Week Points
                  </TableCell>
                  <TableCell align="center" className={classes.cell}>
                    This Week Opponent
                  </TableCell>
                  <TableCell align="center" className={classes.cell}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {starterAthleteIds.map((id, index) => {
                  // const athelete = atheleteData[key];
                  // NOTE: if id == 0, that means the connectedAccount has not
                  // set an athlete in that position for this week in their proxy
                  const athlete = ownedAthletesMetadata[id];
                  console.log(
                    "starterID #" + id + ": " + JSON.stringify(athlete, null, 2)
                  );
                  return (
                    <TableRow
                      key={index.toString()}
                      sx={{ background: index % 2 ? "#473D3D" : "#8E8E8E" }}
                    >
                      <TableCell align="center">
                        <Typography fontSize={30}>
                          {" "}
                          {positions[index]}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                          // justifyContent: "space-around",
                          // justifyContent: "center",
                        }}
                        align="center"
                      >
                        <Image
                          src={id != 100 ? athlete?.image : logo}
                          width={"40"}
                          // layout="fill"
                          height={"40"}
                        />
                        <div>
                          <Typography
                            fontSize={30}
                            onClick={() => handleStateModal(athlete, index)}
                          >
                            {id != 100 ? athlete?.name : "(none)"}
                          </Typography>
                          <Typography component="div">
                            {id != 100 && athlete?.score}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <div>
                          <Typography fontSize={30}>
                            {/* todo get score from datafetch */}
                            {id != 100 && currentWeekNum != 0
                              ? athlete?.prevPoints
                              : "(0)"}
                          </Typography>
                          {/* <Typography>
                            {id != 100  && "69/69/69"}
                          </Typography> */}
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <div>
                          <Typography fontSize={30} textTransform="uppercase">
                            {id != 100 &&
                              // currentWeekNum != 0 &&
                              "*pull opp from backend"}
                          </Typography>
                          <Typography>
                            {id != 100 &&
                              // currentWeekNum != 0 &&
                              "*pull date from backend"}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => handleSubModal(athlete, index)}
                          style={{
                            background:
                              "linear-gradient(135deg, #00FFFF 0%, #FF00FF 0.01%, #480D48 100%)",
                            borderRadius: "50px",
                            padding: "10px 40px",
                            fontWeight: "600",
                            fontSize: "20px",
                          }}
                          disabled={isLineupLocked}
                        >
                          {id != 100 ? "SUB" : "SET"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {!isLoading && (
            <>
              <PlayerStateModal
                // position={currentPositionIndex}
                modalOpen={stateModalOpen}
                // playerName={selectedPlayer.name}
                playerName={
                  starterAthleteIds[currentPositionIndex] != 0
                    ? selectedPlayer?.name
                    : "(none)"
                }
                handleModalClose={handleStateModalClose}
              />
              <PlayerSelectModal
                positionIndex={currentPositionIndex}
                modalOpen={subModalOpen}
                // stateData={currentPlayer}
                submitStarterHandler={submitStarterHandler}
                ownedAthletesInPosition={getFilteredOwnedAthletes()}
                currentStarterID={starterAthleteIds[currentPositionIndex]}
                handleModalClose={handleStateModalClose}
                setSelectedPlayer={setSelectedPlayer}
                selectedPlayer={selectedPlayer}
              />
            </>
          )}
        </Container>
      )}
    </>
  );
}
