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

export default function MyLeagues({ setDisplay }) {
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [currLeague, setCurrLeague] = useState(null);
  const [activeLeagueList, setActiveLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);

  const exampleData = {
    leagueName: "Jinxers",
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
      console.log("in useEFfect");
      setLeagueMakerContract(LeagueMakerContract);
      async function fetchData() {
   
        // const activeLeagues = await LeagueMakerContract.leagueAddresses(1);
        const activeLeagues = await LeagueMakerContract.userToLeagueMap(accountData.address, 0);
        console.log("activeLeagues: " + activeLeagues);
        setActiveLeagueList([...activeLeagueList, activeLeagues]);
      }
      fetchData();
    }
    else {
      console.log("no account data");
    }
  }, []);

  var listItems = activeLeagueList.map((leagueAddress, index) =>
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
            color="primary"
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
          <ul>{listItems}</ul>

          {activeLeagueList.map((leagueAddress, index) => {
              console.log("league #" + index + ": " + leagueAddress);
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
        </Box>
      )}
      {leagueOpen && (
        <LeagueDetails leagueData={currLeague} setLeagueOpen={setLeagueOpen} />
      )}
    </Box>
  );
}
