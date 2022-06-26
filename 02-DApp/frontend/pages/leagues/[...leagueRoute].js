// Router
import { Typography } from "@mui/material";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import AthletesJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/Athletes.json";
import LeagueOfLegendsLogicJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import AddToWhitelist from "../../components/AddToWhitelist.js";
import LoadingPrompt from "../../components/LoadingPrompt.js";
import ViewLeagueTeamMatchup from "../../components/ViewLeagueTeamMatchups.js";
import ViewLeagueTeamsTable from "../../components/ViewLeagueTeamsTable.js";
import Matchups from "../matchups";
import MyTeam from "../myTeam";

export default function LeaguePlayRouter() {
  // Router params
  const router = useRouter();
  const [routedPage, setRoutedPage] = useState();
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false);

  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [inviteListValues, setInviteListValues] = useState([]);

  const [signer, setSigner] = useState(null);
  const [athleteContract, setAthleteContract] = useState();
  const [selectedWeekMatchups, setSelectedWeekMatchups] = useState();
  const [currentWeekNum, setCurrentWeekNum] = useState();
  const [leagueName, setLeagueName] = useState(null);
  const [isError, setIsError] = useState(false);
  const [leagueMemberRecords, setLeagueMemberRecords] = useState([]);
  const [leagueScheduleIsSet, setLeagueScheduleIsSet] = useState();
  const [leagueMembers, setLeagueMembers] = useState([]);
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
      // setIsLoading(false);
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
    // setAthleteNFTs([]);
    if (isConnected && router.isReady) {
      // // console.log("route in myteam:" + JSON.stringify(router.query, null, 2));
      setIsLoading(true);
      // setHasFetchedScores(false);

      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueRoute[0],
        LeagueOfLegendsLogicJSON.abi,
        provider
      );

      setLeagueProxyContract(LeagueProxyContract);

      // Initialize connections to Athlete datastore contract
      const AthleteContract = new ethers.Contract(
        CONTRACT_ADDRESSES.Athletes,
        AthletesJSON.abi,
        provider
      );
      setAthleteContract(AthleteContract);

      let weekMatchups = [];
      async function fetchData() {
        setIsLoading(true);

        const leagueName = await LeagueProxyContract.leagueName().catch((e) => {
          console.error(e);
          setIsLoading(false);
          setIsError(true);
        });
        setLeagueName(leagueName);

        // Get a [3] that represents wins, losses, ties, in that order for each league member

        // const isInLeague = await LeagueProxyContract.inLeague(
        //   connectedAccount
        // ).catch((e) => {
        //   console.error(e);
        //   setIsLoading(false);
        //   setIsError(true);
        // });
        // setIsLeagueMember(isInLeague);

        const currentWeekNum = await LeagueProxyContract.currentWeekNum().catch(
          (e) => {
            console.error(e);
            setIsLoading(false);
            setIsError(true);
          }
        );
        setCurrentWeekNum(Number(currentWeekNum));

        // Get league size, and league members, and records for each member
        const leagueSize = await getRecordsHelper(
          LeagueProxyContract,
          currentWeekNum
        );

        // Get league Admin
        const leagueAdmin = await LeagueProxyContract.admin();
        setIsLeagueAdmin(leagueAdmin == connectedAccount);

        // Get selected weeks matchups from league proxy schedule
        weekMatchups = await LeagueProxyContract.getScheduleForWeek(
          currentWeekNum
        ).catch((e) => {
          console.error("get schedule for week error: " + e);
          setIsLoading(false);
          setIsError(true);
        });

        // let shifter
        // Slice array, by finding how many slots in return weekMatchups array to skip (due to setLeagueSchedule algorithm)
        const shifter = 4 - Math.round(leagueSize / 2);
        if (weekMatchups) {
          weekMatchups = weekMatchups.slice(shifter);
          // weekMatchups.map((matchup, index) => {
          //   console.log("matchup #" + index + ": " + matchup);
          // });
          setSelectedWeekMatchups(weekMatchups);
          if (weekMatchups.length > 0) {
            setLeagueScheduleIsSet(true);
          }
        }
        setIsLoading(false);
      }
      fetchData();
    }
  }, [isConnected, router.isReady, connectedAccount]);

  useEffect(() => {
    if (!isLoading) getLeagueSchedule();
  }, [currentWeekNum]);

  const getLeagueSizeHelper = async (LeagueProxyContract) => {
    let i = 0;
    let error = "none";
    do {
      await LeagueProxyContract.leagueMembers(i).catch((_error) => {
        error = _error;
        // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
        // console.log("User To League Map Error: " + _error.message);
      });

      if (error == "none") {
        i++;
      }
      // console.log("error value at end:" + error);
    } while (error == "none");
    return i;
  };

  const getRecordsHelper = async (LeagueProxyContract, currentWeekNum) => {
    let i = 0;
    let error = "none";
    const records = [];
    const leagueMembersTemp = [];
    do {
      const leagueMember = await LeagueProxyContract.leagueMembers(i).catch(
        (_error) => {
          error = _error;
          // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
          // console.log("User To League Map Error: " + _error.message);
        }
      );

      if (error == "none") {
        i++;
        const record = await LeagueProxyContract.getUserRecord(leagueMember);
        // const record = await LeagueProxyContract.userToRecord(leagueMember, week);
        // const leagueMember =
        console.log("league member #" + i + ": " + record);

        leagueMembersTemp.push(shortenAddress(leagueMember));
        records.push(formatUserRecordHelper(record, currentWeekNum));
      }
      // console.log("error value at end:" + error);
    } while (error == "none");
    setLeagueMemberRecords(records);
    setLeagueMembers(leagueMembersTemp);
    return i;
  };

  const formatUserRecordHelper = (rawRecord, currentWeekNum) => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    rawRecord.map((result, index) => {
      switch (result) {
        case 2:
          ties++;
          break;
        case 1:
          wins++;
          break;
        // case 0:
        //   losses++;
        //   break;
        default:
          break;
      }
    });
    // Losses should equal the total number of games player - the wins and the ties
    losses = currentWeekNum - wins - ties;
    return [wins, losses, ties];
  };

  const shortenAddress = (address) => {
    // console.log("address to shorten: " + address);
    const shortenedAddress1 = `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
    return shortenedAddress1;
    // setIsConnected(true);
  };

  async function getLeagueSchedule() {
    // Get league size
    const leagueSize = await getLeagueSizeHelper(leagueProxyContract);

    console.log("league size: " + leagueSize);
    let weekMatchups = [];
    weekMatchups = await leagueProxyContract
      .getScheduleForWeek(currentWeekNum)
      .catch((_error) => {
        // error = _error;
        alert("Error! : " + JSON.stringify(error, null, 2));
        // console.log("User To League Map Error: " + _error.message);
      });

    const shifter = 4 - Math.round(leagueSize / 2);
    // console.log("shifter size: " + shifter);

    weekMatchups = weekMatchups.slice(shifter);
    // weekMatchups.map((matchup, index) => {
    //   console.log("matchup #" + index + ": " + matchup);
    // });

    setSelectedWeekMatchups(weekMatchups);
  }

  // async function getLeagueMembersHelper() {
  //   leagueProxyContract.
  // }

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
    case "schedule":
      return (
        <>
          {isLoading ? (
            <LoadingPrompt loading={"Your Schedule"} />
          ) : (
            <>
              <ViewLeagueTeamsTable
                connectedAccount={connectedAccount}
                leagueAddress={router.query.leagueRoute[0]}
                leagueName={leagueName}
                teamNames={leagueMembers}
                teamRecords={leagueMemberRecords}
              ></ViewLeagueTeamsTable>
              <br></br>
              <ViewLeagueTeamMatchup
                leagueScheduleIsSet={leagueScheduleIsSet}
                week={currentWeekNum}
                setWeek={setCurrentWeekNum}
                weeklyMatchups={selectedWeekMatchups}
              ></ViewLeagueTeamMatchup>
              {isLeagueAdmin && (
                <>
                  <br></br>
                  <Typography
                    variant="h4"
                    color="secondary"
                    textAlign={"center"}
                  >
                    Admin Functions
                  </Typography>
                  <AddToWhitelist
                    setInviteListValues={setInviteListValues}
                    inviteListValues={inviteListValues}
                    connectedAccount={connectedAccount}
                  ></AddToWhitelist>
                </>
              )}
              <br></br>
            </>
          )}
        </>
      );
      break;
    default:
      return <LoadingPrompt loading={"Your League"} />;
      break;
  }
  // } else return <LoadingPrompt loading={"League Dashborad"}></LoadingPrompt>;
}
