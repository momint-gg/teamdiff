import { Box, Card, CardContent, CardHeader, Paper, Typography, Divider, Link } from "@mui/material";
import { border } from "@mui/system";
// Web3 Imports
import { ethers } from "ethers";
import Image from "next/image";
// Router
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import logo from "../assets/images/logoIcon.png";


export default function LeagueCard({ leagueAddress }) {

  // Router
  const router = useRouter();

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [weekNum, setWeekNum] = useState(null);
  const [leagueSize, setLeagueSize] = useState(1);
  const [matchups, setMatchups] = useState([])

  useEffect(() => {
    if (leagueAddress) {
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      setLeagueProxyContract(LeagueProxyContract);
      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        const weekNum = await LeagueProxyContract.currentWeekNum();
        const matchupsRes = await LeagueProxyContract.getScheduleForWeek(weekNum)
        setWeekNum(parseInt(weekNum)+1);
        setLeagueName(leagueName);
        setMatchups(matchupsRes)
        let i = 0;
        let error = "none";

        // Continue to add leagues to activeLEagueList and pendingLeagueList
        // until we hit an error (because i is out of range presumably)
        do {
          const whitelistedLeague = await LeagueProxyContract.leagueMembers(
            i
          ).catch((_error) => {
            error = _error;
          });

          if (error == "none") {
            i++;
          }
        } while (error == "none");
        setLeagueSize(i);
      }
      fetchData();
    } else {
      console.log("no account data or league Address found");
    }
  }, []);

  const card = (
    <Fragment>
      <CardHeader sx={{
        background:"#343434 !important",
        paddingLeft:"10%",
        height:"3rem",
        borderBottom:"solid white 0.01rem",
        minWidth:"20rem"
        }}
        title={leagueName? leagueName + " // WEEK " + weekNum : "(Untitled)" + " // WEEK " + weekNum}
        >

      </CardHeader>
      <CardContent>
        <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}>
          <Box component="div" sx={{
            wordWrap: 'break-word',
          }}>
          <Box 
          sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
          }}>
          <Typography fontSize={20} fontWeight={"bold"} variant="body1" color="inherit">
            Willhunter.eth
          </Typography>
          <Box sx={{display:"flex"}}>
          <Typography fontSize={20} fontWeight={"bold"} variant="body1" color="inherit">
            3
          </Typography>
          <Image
            src={logo}
            alt="logo"
            width="30px"
            height="30px"
        />
        </Box>
          </Box>
          <Typography fontSize={14} 
            fontStyle={"italic"} 
            variant="body1" 
            color="inherit">
            {"Record: 0 - 1 - 1"}
          </Typography>
          <Box 
          sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
          }}>
          <Typography noWrap maxWidth="10rem" fontSize={20} fontWeight={"bold"} variant="body1" color="inherit">
            reggiecailonglong.eth
          </Typography>
          <Box sx={{display:"flex"}}>
          <Typography fontSize={20} fontWeight={"bold"} variant="body1" color="inherit">
            2
          </Typography>
          <Image
            src={logo}
            alt="logo"
            width="30px"
            height="30px"
        />
        </Box>
          </Box>
          <Typography fontSize={14} 
            fontStyle={"italic"} 
            variant="body1" 
            color="inherit">
            {"Record: 1 - 0 - 1"}
          </Typography>
          <Divider sx={{marginTop:5, marginBottom:"-6%"}} variant="middle" color="white" />
          <Box 
          sx={{
              display:"flex",
              marginTop:3,
              width:"100%",
              justifyContent:"space-evenly",
              marginBottom:"-6%",
              }}>
            <Link 
              href={"/myTeam?leagueRoute="+leagueAddress}
            >
              <Typography fontSize={18} fontWeight={"bold"} color="secondary">
                MY TEAM
              </Typography>
            </Link>
            {/* <Divider orientation="vertical" variant="middle" flexItem /> */}
            <Link 
              href={"/leagues/"+leagueAddress}
            >
              <Typography fontSize={18} fontWeight={"bold"} variant="body1" color="secondary">
                VIEW LEAGUE
              </Typography>      
            </Link>    
        </Box>
          </Box>
          
        </Box>
      </CardContent>
    </Fragment>
  );

  return (
    <Card variant="outlined" 
    sx={{
      background: "linear-gradient(124.78deg, rgba(47, 13, 50, 0.75) 6.52%, rgba(116, 14, 122, 0.75) 78.06%, rgba(0, 255, 255, 0.75) 168.56%)",
      borderRadius: "10%",
      }}>
      {/* <Link href= {"/leagues/" + leagueAddress}> */}
      {card}
      {/* </Link> */}
    </Card>
  );
}
