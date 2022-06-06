import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress
} from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useMediaQuery } from "react-responsive";
import logo from "../assets/images/example.png";
import PlayerStateModal from "../components/PlayerStateModal";
import PlayerSelectModal from "../components/PlayerSelectModal";
import Card1 from "../assets/cards/Fudge.png";
import Card2 from "../assets/cards/Abbedagge.png";
import Sample from "../../backend/sample.json";
import { useRouter } from "next/router";
//Web3 Imports
import { ethers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
const atheleteData = Sample.athleteData;
//Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json";
import AthletesJSON from "../../backend/contractscripts/contract_info/abis/Athletes.json";
import constants from "../constants";

// TODO get data from backend
const players = [
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card1,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card2,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card1,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card2,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card1,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card1,
  },
];

export default function MyTeam() {
  //Router params
  const router = useRouter();
  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
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

  const [currentPlayer, setCurrentPlayer] = useState({});
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
  const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);
  const [athleteContract, setAthleteContract] = useState();
  const [ownedAthletesMetadata, setOwnedAthletesMetadata] = useState([]);

  //DAte
  const d = new Date();
  let today = d.getDay() + 1;
  //Set to corresponding lock day Sun = 1, Sat = 7
  let leagueLockDay = 1;
  let daysTillLock = leagueLockDay % today;

  let starterAthleteData = {
    "top": {
      img: null,
      name: null,
      prevPoints: null,
      opponent: null,
      date: null
    }, 
    "jungle": {
        img: null,
      name: null,
      prevPoints: null,
      opponent: null,
      date: null    
    }, 
    "mid": {
        img: null,
      name: null,
      prevPoints: null,
      opponent: null,
      date: null    
    }, 
    "laner": {
         img: null,
      name: null,
      prevPoints: null,
      opponent: null,
      date: null   
    }, 
    "support": {
        img: null,
      name: null,
      prevPoints: null,
      opponent: null,
      date: null    
    }, 
   }
  useEffect(() => {
    // console.log("today" + daysTillLock)
    // setIsCreatingLeague(false);
    // setHasCreatedLeague(true);
    // setHasJoinedLeague(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

      // const fetchData = async () => {
      //   const currentAddress = await signer.getAddress()
      //   setAddressPreview(currentAddress)
      // }
      // fetchData()
      const setAccountData = async () => {
        // setIsLoading(true);
        const signer = provider.getSigner()
        const accounts = await provider.listAccounts();

        if(accounts.length > 0) {
          const accountAddress = await signer.getAddress()
          setSigner(signer)
          setConnectedAccount(accountAddress)
          setIsConnected(true)
          //TODO this doesn't update screen when switching accounts :/
        }
        else {
          setIsConnected(false);

        }
        // setIsLoading(false);
      }
      setAccountData()
      provider.provider.on('accountsChanged', (accounts) => { setAccountData() })
      provider.provider.on('disconnect', () =>  { console.log("disconnected"); 
                                                  setIsConnected(false) })
    }, [isConnected]);


    useEffect(() => {
      setAthleteNFTs([]);
      if (isConnected && router.isReady) {
        setIsLoading(true);
        // Initialize connections to GameItems contract
        const LeagueProxyContract = new ethers.Contract(
          router.query.leagueAddress,
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


        const getStarterAthleteData = async (starterIds) => {
            starterIds.forEach((id, index) => {
              // let prevPoints = AthleteContract.athleteToScores(id, currentWeekNum - 1)

            })
        }

        async function fetchData() {
          setIsLoading(true);

          const leagueName = await LeagueProxyContract.leagueName();
          setLeagueName(leagueName);
          const isInLeague = await LeagueProxyContract.inLeague(connectedAccount);
          setIsLeagueMember(isInLeague);
          const currentWeekNum = await LeagueProxyContract.currentWeekNum();
          setCurrentWeekNum(currentWeekNum);
          let starterIds = [null,null,null,null,null]
          for(let i = 0; i <= 4; i++) {
            let id = await LeagueProxyContract.userToLineup(connectedAccount, i).catch((e)=>console.log("error: " + e))
            starterIds[i] = id;
          }
          setStarterAthleteIds(starterIds); 

          //TODO if is not league member, refresh the page
          if(!isInLeague) {
            router.reload(window.location.pathname)
          }

          //TODO this is slightly buggy when someone tries to switch accounts
          // setIsLoading(false);

        }



  
        // declare the async data fetching function
        const getNFTData = async () => {
          const web3 = createAlchemyWeb3(constants.ALCHEMY_LINK);
  
          const nfts = await web3.alchemy.getNfts({
            owner: connectedAccount,
            contractAddresses: [CONTRACT_ADDRESSES.GameItems],
          });
  
          setNFTResp(nfts);
          let athleteMetadata = [];

          for (const nft of nfts?.ownedNfts) {
            const token = nft?.id?.tokenId;
            const response = await web3.alchemy.getNftMetadata({
              contractAddress: CONTRACT_ADDRESSES.GameItems,
              tokenId: token,
            });
            // console.log("Token #" + token + " metadata: " + JSON.stringify(response, null, 2));
            if (!response.title?.includes("Pack")) {
              athleteMetadata[parseInt(token)] = response.metadata;
              setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
            }
          }
          setOwnedAthletesMetadata(athleteMetadata);
          setIsLoading(false);

          athleteMetadata.forEach((athlete, index) => {
            if(index == 0)
              console.log("athlete id #" + index + ": " + JSON.stringify(athlete, null, 2));
          })
        };

  
        getNFTData().catch((error) => {
          console.log("fetch NFT DATA error: " + error);
        });
        fetchData();

      } else {
        //alert("no account data or league Address found, please refresh.");
        console.log("no account data or league Address found");
        // console.log("router: " + JSON.stringify(router.query, null, 2));
        //   console.log("leagueAddress: " + leagueAddress);
      }
    }, [isConnected, router.isReady, connectedAccount]);
  
  const handleStateModal = (player) => {
    setCurrentPlayer(player);
    setStateModalOpen(true);
  };

  const handleSubModal = (player) => {
    setCurrentPlayer(player);
    setSubModalOpen(true);
  };

  const handleStateModalClose = () => {
    setStateModalOpen(false);
    setSubModalOpen(false);
  };

  const generateStarterAthleteRows = () => {
    starterAthleteIds.map((id, index) => {

    })
  }

  useEffect(() => {
          
    ownedAthletesMetadata.forEach((athlete, index) => {
      console.log("athlete  in Useeffectid #" + index + ": " + JSON.stringify(athlete, null, 2));
    })
  }, [isLoading])

  return (
    <>
  {isLoading ? (
          <Container maxWidth="lg" justifyContent="center" alignItems="center">
          <Box
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              display: "flex",
            }}
          >
            <Typography variant="h5" color="white" component="div">
              Loading
            </Typography>
            <br></br>
            <CircularProgress />
          </Box>
        </Container>
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
          {"Week #" + currentWeekNum + ": Roster Locks in " + daysTillLock + " Days"}
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
                  Previous Points
                </TableCell>
                <TableCell align="center" className={classes.cell}>
                  Opponent
                </TableCell>
                <TableCell align="center" className={classes.cell}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(starterAthleteIds).map((id, index) => {
                // const athelete = atheleteData[key];
                const athlete = ownedAthletesMetadata[43];
                // if(id != 0)
                console.log("athlete index: " + index +  " = " + JSON.stringify(ownedAthletesMetadata[index], null, 2));
                const positions = ["Top", "Jungle", "Mid", "Laner", "Support"]
                return (
                  <TableRow
                    key={index.toString()}
                    sx={{ background: index % 2 ? "#473D3D" : "#8E8E8E" }}
                  >
                    <TableCell align="center">
                      <Typography fontSize={30}> {positions[index]}</Typography>
                    </TableCell>
                          <TableCell
                            sx={{ display: "flex", alignItems: "center" }}
                            align="center"
                          >

                            <Image 
                              src={id != 0 ? athlete.image : logo} 
                              width={"10"}
                              height={"10"}
                            />
                            <div>
                              <Typography
                                fontSize={30}
                                onClick={() => handleStateModal(athelete)}
                              >
                                {id != 0 ? athlete.name : "none set"}
                              </Typography>
                              <Typography component="div">{athlete.score}</Typography>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            <div>
                              <Typography fontSize={30}>
                                {id != 0 ? 32 : "none"}
                              </Typography>
                              <Typography>{id != 0 ? 32 : "no date"}</Typography>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            <div>
                              <Typography fontSize={30} textTransform="uppercase">
                                {id != 0 ? "c9" : "none"}
                              </Typography>
                              <Typography>{id != 0 ? "7/12/12" : "no date"}</Typography>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              onClick={() => handleSubModal(athelete)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #00FFFF 0%, #FF00FF 0.01%, #480D48 100%)",
                                borderRadius: "50px",
                                padding: "10px 40px",
                                fontWeight: "600",
                                fontSize: "20px",
                              }}
                            >
                              SUB
                            </Button>
                          </TableCell>                  

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <PlayerStateModal
          modalOpen={stateModalOpen}
          stateData={Sample.statsData}
          handleModalClose={handleStateModalClose}
        />
        <PlayerSelectModal
          modalOpen={subModalOpen}
          stateData={currentPlayer}
          players={players}
          handleModalClose={handleStateModalClose}
        />
      </Container>
  )}
    </>
  );
}
