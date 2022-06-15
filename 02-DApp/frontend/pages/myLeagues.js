import { Box, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
// import LeagueDetails from "./leagueDetails";
// Web3 Imports
import { ethers } from "ethers";
import { useEffect, useState } from "react";
// Wagmi imports
import { useSigner } from "wagmi";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import LeagueCard from "../components/LeagueCard";

export default function MyLeagues({ setDisplay }) {
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [currLeague, setCurrLeague] = useState(null);
  const [activeLeagueList, setActiveLeagueList] = useState([]);
  const [pendingLeagueList, setPendingLeagueList] = useState([]);
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const [mountedLeagueAddress, setMountedLeagueAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()
    const setAccountData = async () => {
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
      console.log("disconnected");
      setIsConnected(false);
    });
  }, []);

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const { data: signerData } = useSigner();

  // TODO how to add hook for when we change our connected wallet?
  useEffect(() => {
    setActiveLeagueList([]);
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
        // setActiveLeagueList([]);
        // setPendingLeagueList([]);
        // const activeLeagues = await LeagueMakerContract.leagueAddresses(1);
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
            // console.log("User To League Map Error: " + _error.message);
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
            // console.log("isInleague:" + isInLeague);
            const admin = await LeagueProxyContract.admin();
            // console.log("admin: " + admin);
            // Add League address  to appropriate state list
            // TODO we
            isInLeague
              ? setActiveLeagueList((activeLeagueList) => [
                  ...activeLeagueList,
                  whitelistedLeague,
                ])
              : setPendingLeagueList((pendingLeagueList) => [
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
    setActiveLeagueList([]);
    setPendingLeagueList([]);
  }, []);

  const activeListItems = activeLeagueList.map((leagueAddress, index) => (
    <Box key={index}>
      <LeagueCard
        // leagueData={exampleData}
        leagueAddress={leagueAddress}
        // isJoined={true}
        // setMountedLeagueAddress={setMountedLeagueAddress}

        // setLeague={setCurrLeague}
        // setLeagueOpen={setLeagueOpen}
      />
      <hr></hr>
    </Box>
  ));

  // Create list of league cards for all pending leagues
  const pendingListItems = pendingLeagueList.map((leagueAddress, index) => (
    <Box key={index}>
      <LeagueCard
        // leagueData={exampleData}
        leagueAddress={leagueAddress}
        // isJoined={false}
        // setMountedLeagueAddress={setMountedLeagueAddress}

        // setLeague={setCurrLeague}
        // setLeagueOpen={setLeagueOpen}
      />
      <hr></hr>
    </Box>
  ));

  return (
    <Box>
      {!leagueOpen && (
        <Box>
          {/* <Fab
            variant="extended"
            size="small"
            aria-label="add"
            onClick={() => setDisplay(false)}
          >
            &#60; BACK
          </Fab> */}

          <Typography variant="h4" color="secondary" component="div">
            Active Leagues
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
          {/* <LeagueCard
                leagueData={exampleData}
                leagueAddress={exampleData.leagueName}
                setLeague={setCurrLeague}
                setLeagueOpen={setLeagueOpen}
              /> */}

          <Typography
            variant="h4"
            color="secondary"
            component="div"
            sx={{ marginTop: 5 }}
          >
            Pending Leagues
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
        </Box>
      )}
      {/* {leagueOpen && (
        <LeagueDetails leagueData={currLeague} leagueAddress={mountedLeagueAddress} setLeagueOpen={setLeagueOpen} />
      )} */}
    </Box>
  );
}
