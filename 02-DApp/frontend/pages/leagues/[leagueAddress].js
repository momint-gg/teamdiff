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
  CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";

import { useRouter } from 'next/router'

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
      console.log('Success', data)
    },
  });
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [leagueAddress, setLeagueAddress] = useState(router.query.leagueAddress);
  const [isLeagueMember, setIsLeagueMember] = useState(false);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false);
  const [isOnWhitelist, setIsOnWhitelist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    // console.log("leagueAddress: " + leagueAddress)
    // console.log("router: " + JSON.stringify(router.query, null, 2));
    //console.log("signerData: " + JSON.stringify(signerData, null, 2));
    if (accountData && leagueAddress) {
      
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      setLeagueProxyContract(LeagueProxyContract);
        

      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        const isInLeague = await LeagueProxyContract.inLeague(accountData.address);
        setIsLeagueMember(isInLeague);
        console.log("isInLeague: " + isInLeague)
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
        const isOnWhitelist = await WhitelistContract.whitelist(accountData.address);
        //console.log("user is on whitelist: " + isOnWhitelist);
        setIsOnWhitelist(isOnWhitelist);
        setIsLoading(false);

      }
      fetchData();
    }
    else {
        //alert("no account data or league Address found, please refresh.");
      console.log("no account data or league Address found");
    }
  }, [signerData]);


  const joinLeagueHandler = async () => {

    console.log("joining league: " + leagueAddress);
    //console.log("signer dataL: " + JSON.stringify(signerData, null, 2));
    const leagueProxyContractWithSigner = leagueProxyContract.connect(signerData);
    const joinLeagueTxn = await leagueProxyContractWithSigner
    .joinLeague()
    // .joinLeague({
    //     gasLimit: 20000000
    // })
    .then((res) => {
        console.log("txn result: " + JSON.stringify(res, null, 2));
        console.log("Txn: " + JSON.stringify(joinLeagueTxn, null, 2))
        console.log("joined league")
    })
    .catch((error) => {
      //console.log("")
      alert("Join League error: " + error.message);
    });
  }

  
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
                {isLeagueAdmin && (
                    <Box>
                        <Typography>
                            Admin Actions
                        </Typography>
                        <ul>
                            <li>Add Users to Whitelist</li>
                        </ul>
                    </Box>
                )}
                </>
          ) : (
            (isOnWhitelist ? (
            <>
                <Typography>
                {"You are whitelisted for this league, click below to accept the invitation to: " + leagueName} 
                </Typography>
                <Fab
                onClick={joinLeagueHandler}
                >
                Join League
                </Fab>
            </>
            ) : (
                <>
                <Typography>
                {"IDK how tf you got here, but you aren't whitelisted for this league, please contact the admin " 
                    + " of the league if you would like to be added."} 
                </Typography>
            </>
            ))
            
          )}
          </>
      )}
     
    </Box>
  );
}
