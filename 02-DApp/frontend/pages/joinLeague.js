import { Box, CircularProgress, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
// import LeagueDetails from "./leagueDetails";
// Web3 Imports
import { ethers } from "ethers";
import { useEffect, useState } from "react";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesMatic.js";
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/maticAbis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json";
import WhitelistJSON from "../../backend/contractscripts/contract_info/maticAbis/Whitelist.json";
// Component Imports
import PendingLeagueCard from "../components/PendingLeagueCard";

export default function JoinLeague({ setDisplay }) {
  const [publicLeagueList, setPublicLeagueList] = useState([]);
  const [pendingLeagueList, setPendingLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // TODO change to matic network for prod
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
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
        setIsLoading(true);
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
        setIsLoading(false);
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

  // Making sure we're conncted to correct network
  const chainId = "4";
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== chainId) {
        alert("Please connect to Rinkeby!");
        window.location = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkNetwork();
  }, []);

  const publicListItems = publicLeagueList.map((leagueAddress, index) => (
    <Box key={index} sx={{ marginRight: 3, marginBottom: 3 }}>
      <PendingLeagueCard leagueAddress={leagueAddress} />
    </Box>
  ));

  // Create list of league cards for all pending leagues
  const pendingListItems = pendingLeagueList.map((leagueAddress, index) => (
    <Box key={index} sx={{ marginRight: 3, marginBottom: 3 }}>
      <PendingLeagueCard leagueAddress={leagueAddress} />
    </Box>
  ));

  return (
    <Box>
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
      {isLoading ? (
        <>
          <Typography>Loading Whitelisted Leagues</Typography>
          <CircularProgress></CircularProgress>
        </>
      ) : (
        {
          ...(pendingLeagueList.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {pendingListItems}
            </Box>
          ) : (
            <Typography variant="h6" color="primary" component="div">
              (No Pending Leagues)
            </Typography>
          )),
        }
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
      {isLoading ? (
        <>
          <Typography>Loading Public Leagues</Typography>
          <CircularProgress></CircularProgress>
        </>
      ) : (
        {
          ...(publicLeagueList.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {publicListItems}
            </Box>
          ) : (
            <Typography variant="h6" color="primary" component="div">
              (No Active Leagues)
            </Typography>
          )),
        }
      )}
    </Box>
  );
}
