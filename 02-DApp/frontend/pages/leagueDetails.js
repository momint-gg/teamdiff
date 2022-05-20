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
} from "@mui/material";
import { useState, useEffect } from "react";
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
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json";


export default function LeagueDetails({ leagueData, leagueAddress, isJoined, setLeagueOpen }) {
   //WAGMI Hooks
 const { data: accountData, isLoading, error } = useAccount({ ens: true })
const { disconnect } = useDisconnect()
  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const { data: signerData } = useSigner()
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);


  
  useEffect(() => {
    //console.log("leagueADdy: " + leagueAddress)
    if (accountData && leagueAddress) {
      
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      // console.log("in useEFfect");
      setLeagueProxyContract(LeagueProxyContract);
      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        //setMountedLeagueAddress(leagueAddress);
        // console.log("leagueName: " + JSON.stringify(LeagueProxyContract, null, 2));
        //setActiveLeagueList(activeLeagues);
      }
      fetchData();
    }
    else {
      console.log("no account data or league Address found");
    }
  }, []);


  const joinLeagueHandler = async () => {
    console.log("joining league: " + leagueAddress);
    const joinLeagueTxn = await leagueProxyContract.connect(signerData)
    .joinLeague()
    .then(
      console.log("joined league")
    )
    .catch((error) => {
      //console.log("")
      alert("Join League error: " + error.message);
    });
  }

  
  return (
    
    <Box>
      <Fab
        variant="extended"
        size="small"
        color="primary"
        aria-label="add"
        onClick={() => {
          setLeagueOpen(false);
        }}
      >
        &#60; BACK
      </Fab>
      {isJoined ? (
        <>
            <Avatar
              alt="League Image"
              src={leagueData?.image?.examplePic.src}
              sx={{ bgcolor: "white", position: "absolute" }}
            />
            <Box sx={{ marginLeft: 6 }}>
              <Typography variant="h2" color="secondary" component="div">
                {leagueName && leagueName}
              </Typography>

              <Typography variant="body1" color="white">
                Your current standing: {leagueData?.standing}
              </Typography>

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
                  />
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
                  />
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
                  />
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
                  />
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
                  />
                </Grid>
              </Grid>
            </Box>
            </>
      ) : (
        <>
        <Typography>
          {"You are whitelisted for this league, click below to accept the invitation to: "} 
        </Typography>
        <Typography>
          {leagueName && leagueName}
        </Typography>
        <Fab
          onClick={joinLeagueHandler}
        >
          Join League
        </Fab>
        </>
      )}
     
    </Box>
  );
}
