import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Avatar,
  Box,
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


export default function LeagueCard({ leagueData, leagueAddress, setLeague, setLeagueOpen }) {
  //WAGMI Hooks
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const [{ data: signerData, error, loading }, getSigner] = useSigner();
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
      console.log("in useEFfect");
      setLeagueProxyContract(LeagueProxyContract);
      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        //console.log("leagueNamer: " + leagueName);
        //setActiveLeagueList(activeLeagues);
      }
      fetchData();
    }
    else {
      console.log("no account data or league Address found");
    }
  }, []);
  
  const card = (
    <Fragment>
      <CardContent>
        <Avatar
          alt="League Image"
          src={leagueData?.image?.examplePic.src}
          sx={{ bgcolor: "white", position: "absolute" }}
        />
        <Box sx={{ marginLeft: 6 }}>
          <Typography variant="h5" color="secondary" component="div">
            {leagueName}
          </Typography>

          <Typography variant="body1" color="inherit">
            Your current standing: {leagueData?.standing}
          </Typography>
        </Box>
      </CardContent>
    </Fragment>
  );

  return (
    <Card
      variant="outlined"
      onClick={() => {
        setLeague(leagueData);
        setLeagueOpen(true);
      }}
    >
      {card}
    </Card>
  );
}
