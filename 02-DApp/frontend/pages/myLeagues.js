
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
} from "@mui/material";

import examplePic from "../assets/images/jinx.webp";
import LeagueCard from "../components/LeagueCard";
import LeagueDetails from "./leagueDetails";
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

export default function MyLeagues({ setDisplay }) {
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [currLeague, setCurrLeague] = useState(null);
  const [activeLeagueList, setActiveLeagueList] = useState([]);
  const [pendingLeagueList, setPendingLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);

  const exampleData = {
    leagueName: "Katie's League",
    image: { examplePic },
    standing: "2 of 8",
  };

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
  


  useEffect(() => {
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
        // const activeLeagues = await LeagueMakerContract.leagueAddresses(1);
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
            console.log("white: " + whitelistedLeague);
            //Create League Proxy Instance
            const LeagueProxyContract = new ethers.Contract(
              whitelistedLeague,
              LeagueOfLegendsLogicJSON.abi,
              provider
            );
            //Determine if connected wallet has joined this whitelisted League Address
            // const isInLeague = await LeagueProxyContract.inLeague("0xD926A3ddFBE399386A26B4255533A865AD98f7E3");
            const isInLeague = await LeagueProxyContract.inLeague(accountData.address);
            //TODO This never returns for some reason
              //I think the storage format might be messed up in league proxy, try redeploying
            const leagueMember = await LeagueProxyContract.leagueMembers(0);
            // .catch((_error) => {
            //   error = _error;
            //   //alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
            //   console.log("league member Error: " + _error.message);
            // });
            //Add League address  to appropriate state list
            console.log("LEAGUEMBEER: " + leagueMember);
            console.log("isInLeague: " + i + ": " + isInLeague);
            //console.log("whiteListedLeague: " + whitelistedLeague);
            (isInLeague ? (
              setActiveLeagueList(activeLeagueList => [...activeLeagueList, whitelistedLeague])
            ) : (
              setPendingLeagueList(pendingLeagueList => [...pendingLeagueList, whitelistedLeague])
            ));
          }
          //console.log("error value at end:" + error);

        } while (error == "none");

      }
      fetchData();
    }
    else {
      console.log("no account data");
    }
  }, []);

  //Create list of league cards for all active leagues
  var activeListItems = activeLeagueList.map((leagueAddress, index) =>
      <Box key={index}>
      <LeagueCard
        leagueData={exampleData}
        leagueAddress={leagueAddress}
        setLeague={setCurrLeague}
        setLeagueOpen={setLeagueOpen}
      />
      <Typography>{leagueAddress}</Typography>
      </Box>
  );

  //Create list of league cards for all pending leagues
  var pendingListItems = pendingLeagueList.map((leagueAddress, index) =>
      <Box key={index}>
      <LeagueCard
        leagueData={exampleData}
        leagueAddress={leagueAddress}
        setLeague={setCurrLeague}
        setLeagueOpen={setLeagueOpen}
      />
      <Typography>{leagueAddress}</Typography>
      </Box>
  );

  return (
    <Box>
      {!leagueOpen && (
        <Box>
          <Fab
            variant="extended"
            size="small"
            aria-label="add"
            onClick={() => setDisplay(false)}
          >
            &#60; BACK
          </Fab>

          <Typography variant="h3" color="secondary" component="div">
            ACTIVE LEAGUES
          </Typography>
          <hr
            style={{
              color: "secondary",
              backgroundColor: "secondary",
              height: 5,
            }}
          />
          {activeLeagueList.length > 0 ? (
              <ul>{activeListItems}</ul>
          ) : (
            <Typography variant="h6" color="primary" component="div">
              (No Active Leagues)
            </Typography>   
          )}
          <LeagueCard
                leagueData={exampleData}
                leagueAddress={exampleData.leagueName}
                setLeague={setCurrLeague}
                setLeagueOpen={setLeagueOpen}
              />

          {activeLeagueList.map((leagueAddress, index) => {
              // console.log("league #" + index + ": " + leagueAddress);
              <Box key={index}>
              <LeagueCard
                leagueData={exampleData}
                leagueAddress={leagueAddress}
                setLeague={setCurrLeague}
                setLeagueOpen={setLeagueOpen}
              />
              {/* <Typography>{leagueAddress}</Typography> */}
              </Box>
          })}
          
         
          <Typography
            variant="h3"
            color="secondary"
            component="div"
            sx={{ marginTop: 5 }}
          >
            PENDING LEAGUES
          </Typography>
          <hr
            style={{
              color: "secondary",
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

          {pendingLeagueList.map((leagueAddress, index) => {
              // console.log("league #" + index + ": " + leagueAddress);
              <Box key={index}>
              <LeagueCard
                leagueData={exampleData}
                leagueAddress={leagueAddress}
                setLeague={setCurrLeague}
                setLeagueOpen={setLeagueOpen}
              />
              {/* <Typography>{leagueAddress}</Typography> */}
              </Box>
          })}
        </Box>
      )}
      {leagueOpen && (
        <LeagueDetails leagueData={currLeague} setLeagueOpen={setLeagueOpen} />
      )}
    </Box>
  );
}
