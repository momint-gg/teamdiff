import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Fab,
} from "@mui/material";
//Component Imports
import LeagueCard from "../components/LeagueCard";
// import LeagueDetails from "./leagueDetails";
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
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/abis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json";
import WhitelistJSON from "../../backend/contractscripts/contract_info/abis/Whitelist.json";

export default function JoinLeague({ setDisplay }) {
  const [publicLeagueList, setPublicLeagueList] = useState([]);
  const [pendingLeagueList, setPendingLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const { data: accountData, isLoading: accountDataLoading, error } = useAccount({ ens: true })

  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const { data: signerData } = useSigner()
  
  //TODO how to add hook for when we change our connected wallet?
  useEffect(() => {
    // setActiveLeagueList([]);
    setPendingLeagueList([]);
    if (accountData) {
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      setLeagueMakerContract(LeagueMakerContract);

      //Fetch League membership data for connected wallet
      async function fetchData() {
        var i = 0;
        var error = "none";
        //Continue to add leagues to activeLEagueList and pendingLeagueList
          //until we hit an error (because i is out of range presumably)
        do {
          const whitelistedLeague = await LeagueMakerContract.userToLeagueMap(accountData.address, i)
                                                        .catch((_error) => {
                                                          error = _error;
                                                          //alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
                                                          console.log("User To League Map Error: " + _error.message);
                                                        });

          if(error == "none") {  
            i++;  
            //console.log("member #" + i + ": " + leagueMembers)
            //console.log("white: " + whitelistedLeague);
            //Create League Proxy Instance
            const LeagueProxyContract = new ethers.Contract(
              whitelistedLeague,
              LeagueOfLegendsLogicJSON.abi,
              provider
            );
            //Determine if connected wallet has joined this whitelisted League Address
            // const isInLeague = await LeagueProxyContract.inLeague("0xD926A3ddFBE399386A26B4255533A865AD98f7E3");
            const isInLeague = await LeagueProxyContract.inLeague(accountData.address);
            //Add League address  to appropriate state list
            if(!isInLeague) 
              setPendingLeagueList(pendingLeagueList => [...pendingLeagueList, whitelistedLeague])
          }
          //console.log("error value at end:" + error);

        } while (error == "none");

      }
      fetchData();
    }
    else {
      console.log("no account data");
    }
  }, [accountData?.address]);




  useEffect(() => {
    // setActiveLeagueList([]);
    setPublicLeagueList([]);
    if (accountData) {
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      //setLeagueMakerContract(LeagueMakerContract);

      //Fetch League membership data for connected wallet
      async function fetchData() {
        var i = 0;
        var error = "none";
        //Continue to add leagues to activeLEagueList and pendingLeagueList
          //until we hit an error (because i is out of range presumably)
        do {
          const leagueAddress = await LeagueMakerContract.leagueAddresses(i)
                                                        .catch((_error) => {
                                                          error = _error;
                                                          //alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
                                                          // console.log("User To League Map Error: " + _error.message);
                                                        });

          if(error == "none") {  
            i++;  
            console.log("league #" + i + ": " + leagueAddress)
            //console.log("white: " + whitelistedLeague);
            //Create League Proxy Instance
            const LeagueProxyContract = new ethers.Contract(
              leagueAddress,
              LeagueOfLegendsLogicJSON.abi,
              provider
            );

            const whitelistContractAddress = await LeagueProxyContract.whitelistContract();
            // console.log("white: " + whitelistContract);
            const WhitelistContract = new ethers.Contract(
              whitelistContractAddress,
              WhitelistJSON.abi,
              provider
            );
            //Determine if connected wallet has joined this whitelisted League Address
            // const isInLeague = await LeagueProxyContract.inLeague("0xD926A3ddFBE399386A26B4255533A865AD98f7E3");
            //TODO create an instance of whitelist contract and read isPublic from that;
            const isPublic = await WhitelistContract.isPublic();
            // const isPublic = await LeagueProxyContract.isPublic();
            console.log("\tIs public: " + isPublic);
            const isInLeague = await LeagueProxyContract.inLeague(accountData.address);

            //Add League address  to appropriate state list if the league is public
              //and the user is not already in the league
            if(isPublic && !isInLeague) 
              setPublicLeagueList(publicLeagueList => [...publicLeagueList, leagueAddress])
          }
          //console.log("error value at end:" + error);

        } while (error == "none");

      }
      fetchData();
    }
    else {
      console.log("no account data");
    }
  }, [accountData?.address]);
  //useEffect to update leagues on accountData change
  // var activeListItems;
  // var pendingListItems;
  // useEffect(() => {
  //      //Create list of league cards for all active leagues
  //   console.log("accountDataLoading in useEffect: " + accountDataLoading);
  // }, [accountDataLoading])


  var publicListItems = publicLeagueList.map((leagueAddress, index) =>
  <Box key={index}>
  <LeagueCard
    leagueAddress={leagueAddress}
  />
  <hr></hr>
  </Box>
);

//Create list of league cards for all pending leagues
var pendingListItems = pendingLeagueList.map((leagueAddress, index) =>
  <Box key={index}>
  <LeagueCard
    leagueAddress={leagueAddress}
  />
  <hr></hr>
  </Box>
);

  return (
    <Box>
      {/* <Fab
        variant="extended"
        size="small"
        aria-label="add"
        onClick={() => setDisplay(false)}
      >
        &#60; BACK
      </Fab> */}

      <Typography variant="h3" color="secondary" component="div" marginTop={2}>
        YOUR WHITELISTED LEAGUES
      </Typography>
      <hr
        style={{
          color: "white",
          backgroundColor: "secondary",
          height: 5,
        }}
      />
      {pendingLeagueList.length > 0 ? (
          <ul>{pendingListItems}</ul>
      ) : (
        <Typography variant="h6" color="primary" component="div">
          (No Pending Leagues)
        </Typography>   
      )}
      <Typography variant="h3" color="secondary" component="div">
        PUBLIC LEAGUES
      </Typography>
      <hr
        style={{
          color: "white",
          backgroundColor: "secondary",
          height: 5,
        }}
      />
      {publicLeagueList.length > 0 ? (
          <ul>{publicListItems}</ul>
      ) : (
        <Typography variant="h6" color="primary" component="div">
          (No Active Leagues)
        </Typography>   
      )}
    </Box>
  );
}
