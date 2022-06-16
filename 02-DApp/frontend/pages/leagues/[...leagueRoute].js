// Router
import { Typography } from "@mui/material";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import AthletesJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/Athletes.json";
import LeagueOfLegendsLogicJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import Matchups from "../matchups";
import MyTeam from "../myTeam";

export default function LeaguePlayRouter() {
  // Router params
  const router = useRouter();
  const [routedPage, setRoutedPage] = useState();
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [athleteContract, setAthleteContract] = useState();

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );
  useEffect(() => {
    if (router.isReady) {
      // console.log("router: " + JSON.stringify(router.query, null, 2));
      setRoutedPage(router.query.leagueRoute[1]);
    } else {
      console.log("router not set");
    }
  }, [router]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const setAccountData = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };
    setAccountData();
    provider.provider.on("accountsChanged", (accounts) => {
      setAccountData();
    });
    provider.provider.on("disconnect", () => {
      // console.log("disconnected");
      setIsConnected(false);
    });
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && router.isReady) {
      // // console.log("route in myteam:" + JSON.stringify(router.query, null, 2));
      setIsLoading(true);
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueRoute[0],
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      // const LeagueProxyContract = new ethers.Contract(
      //   router.query.leagueAddress,
      //   LeagueOfLegendsLogicJSON.abi,
      //   provider
      // );
      setLeagueProxyContract(LeagueProxyContract);

      // Initialize connections to Athlete datastore contract
      const AthleteContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Athletes,
        AthletesJSON.abi,
        provider
      );
      setAthleteContract(AthleteContract);
      setIsLoading(false);
    }
  }, [isConnected, router.isReady, connectedAccount]);
  // DAte
  const d = new Date();
  const today = d.getDay() + 1;
  // Set to corresponding lock day Sun = 1, Sat = 7
  const leagueLockDay = 1;
  let daysTillLock;
  let daysTillUnlock;
  today > leagueLockDay
    ? // If today greater than lock day
      (daysTillLock = 7 - today + leagueLockDay)
    : // if today < lock day
      (daysTillLock = leagueLockDay - today);
  if (daysTillLock > 5) {
    daysTillUnlock = 7 - daysTillLock;
  }
  // if (isLoading) {
  switch (routedPage) {
    case "matchups":
      return (
        <Matchups
          daysTillLock={daysTillLock}
          daysTillUnlock={daysTillUnlock}
        ></Matchups>
      );
      break;
    case "myTeam":
      return <MyTeam></MyTeam>;
      break;
    default:
      return <Typography>still loading router</Typography>;
      break;
  }
  // } else return <LoadingPrompt loading={"League Dashborad"}></LoadingPrompt>;
}
