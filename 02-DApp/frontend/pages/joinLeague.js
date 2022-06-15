import { Box, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
// import LeagueDetails from "./leagueDetails";
// Web3 Imports
import { ethers } from "ethers";
import { useEffect, useState } from "react";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import WhitelistJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/Whitelist.json";
// Component Imports
import LeagueCard from "../components/LeagueCard";

export default function JoinLeague({ setDisplay }) {
  const [publicLeagueList, setPublicLeagueList] = useState([]);
  const [pendingLeagueList, setPendingLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const setAccountData = async () => {
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        console.log("updating accounts");
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
      console.log("disconnected");
      setIsConnected(false);
    });
  }, [connectedAccount]);

  // TODO how to add hook for when we change our connected wallet?
  useEffect(() => {
    // setActiveLeagueList([]);
    setPendingLeagueList([]);
    if (isConnected) {
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      setLeagueMakerContract(LeagueMakerContract);

      // Fetch League membership data for connected wallet
      async function fetchData() {
        let i = 0;
        let error = "none";
        // Continue to add leagues to activeLEagueList and pendingLeagueList
        // until we hit an error (because i is out of range presumably)
        do {
          const whitelistedLeague = await LeagueMakerContract.userToLeagueMap(
            connectedAccount,
            i
          ).catch((_error) => {
            error = _error;
            // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
            console.log("User To League Map Error: " + _error.message);
          });

          if (error == "none") {
            i++;
            // console.log("member #" + i + ": " + leagueMembers)
            // console.log("white: " + whitelistedLeague);
            // Create League Proxy Instance
            const LeagueProxyContract = new ethers.Contract(
              whitelistedLeague,
              LeagueOfLegendsLogicJSON.abi,
              provider
            );
            // Determine if connected wallet has joined this whitelisted League Address
            // const isInLeague = await LeagueProxyContract.inLeague("0xD926A3ddFBE399386A26B4255533A865AD98f7E3");
            const isInLeague = await LeagueProxyContract.inLeague(
              connectedAccount
            );
            // Add League address  to appropriate state list
            if (!isInLeague)
              setPendingLeagueList((pendingLeagueList) => [
                ...pendingLeagueList,
                whitelistedLeague,
              ]);
          }
          // console.log("error value at end:" + error);
        } while (error == "none");
      }
      fetchData();
    } else {
      console.log("no account data");
    }
  }, [isConnected, connectedAccount]);

  useEffect(() => {
    // setActiveLeagueList([]);
    setPublicLeagueList([]);
    if (isConnected) {
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      // setLeagueMakerContract(LeagueMakerContract);

      // Fetch League membership data for connected wallet
      async function fetchData() {
        let i = 0;
        let error = "none";
        // Continue to add leagues to activeLEagueList and pendingLeagueList
        // until we hit an error (because i is out of range presumably)
        do {
          const leagueAddress = await LeagueMakerContract.leagueAddresses(
            i
          ).catch((_error) => {
            error = _error;
            // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
            console.log("User To League Map Error: " + _error.message);
          });

          if (error == "none") {
            i++;
            // console.log("league #" + i + ": " + leagueAddress)
            // console.log("white: " + whitelistedLeague);
            // Create League Proxy Instance
            const LeagueProxyContract = new ethers.Contract(
              leagueAddress,
              LeagueOfLegendsLogicJSON.abi,
              provider
            );

            const whitelistContractAddress =
              await LeagueProxyContract.whitelistContract();
            // console.log("white: " + whitelistContract);
            const WhitelistContract = new ethers.Contract(
              whitelistContractAddress,
              WhitelistJSON.abi,
              provider
            );
            // Determine if connected wallet has joined this whitelisted League Address
            // const isInLeague = await LeagueProxyContract.inLeague("0xD926A3ddFBE399386A26B4255533A865AD98f7E3");
            // TODO create an instance of whitelist contract and read isPublic from that;
            const isPublic = await WhitelistContract.isPublic();
            // const isPublic = await LeagueProxyContract.isPublic();
            // console.log("\tIs public: " + isPublic);
            const isInLeague = await LeagueProxyContract.inLeague(
              connectedAccount
            );

            // Add League address  to appropriate state list if the league is public
            // and the user is not already in the league
            // if(isPublic && !isInLeague)
            if (isPublic)
              setPublicLeagueList((publicLeagueList) => [
                ...publicLeagueList,
                leagueAddress,
              ]);
          }
          // console.log("error value at end:" + error);
        } while (error == "none");
      }
      fetchData();
    } else {
      console.log("no account data");
    }
  }, [isConnected, connectedAccount]);

  const publicListItems = publicLeagueList.map((leagueAddress, index) => (
    <Box key={index}>
      <LeagueCard leagueAddress={leagueAddress} />
      <hr></hr>
    </Box>
  ));

  // Create list of league cards for all pending leagues
  const pendingListItems = pendingLeagueList.map((leagueAddress, index) => (
    <Box key={index}>
      <LeagueCard leagueAddress={leagueAddress} />
      <hr></hr>
    </Box>
  ));

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

      <Typography variant="h4" color="secondary" component="div" marginTop={2}>
        Your Whitelisted Leagues
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
      <Typography variant="h4" color="secondary" component="div">
        Public Leagues
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
