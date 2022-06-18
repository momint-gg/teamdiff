import { Box, Card, CardContent, Typography } from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
// Router
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";

// export default function LeagueCard({ leagueAddress, setMountedLeagueAddress, setLeague, setLeagueOpen }) {
export default function PendingLeagueCard({ leagueAddress }) {
  // Router
  const router = useRouter();

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [leagueSize, setLeagueSize] = useState(1);

  useEffect(() => {
    if (leagueAddress) {
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      // console.log("in useEFfect");
      setLeagueProxyContract(LeagueProxyContract);
      async function fetchData() {
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        let i = 0;
        let error = "none";

        // Continue to add leagues to activeLEagueList and pendingLeagueList
        // until we hit an error (because i is out of range presumably)
        do {
          const whitelistedLeague = await LeagueProxyContract.leagueMembers(
            i
          ).catch((_error) => {
            error = _error;
            // alert("Error! Currently connected address has no active or pending leagues. (" + _error.reason + ")");
            // console.log("User To League Map Error: " + _error.message);
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
      <CardContent  >
        <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: "10%",
          alignItems: "center",
        }}>
          <Box component="div" sx={{
            wordWrap: 'break-word',
            maxWidth: '18rem',
            textAlign: 'center',
          }}>
          <Typography fontSize={24} fontWeight={"bold"} variant="body1" color="inherit">
            {leagueName || "(Untitled)"}
          </Typography>
          <Typography fontSize={18} variant="body1" color="inherit">
            {leagueAddress}
          </Typography>
          <Typography fontSize={18} 
            fontStyle={"italic"} 
            variant="body1" 
            color="inherit"
            component="div"
            paddingTop={2}>
            {leagueSize + "/8 players"}
          </Typography>
          </Box>
        </Box>
      </CardContent>
    </Fragment>
  );

  const handleClick = (e) => {
    e.preventDefault();
    const href = "/leagues/" + leagueAddress;
    router.push(href);
  };

  return (
    <Card variant="outlined" onClick={handleClick}
    sx={{
      background: "linear-gradient(124.78deg, rgba(47, 13, 50, 0.75) 6.52%, rgba(116, 14, 122, 0.75) 78.06%, rgba(0, 255, 255, 0.75) 168.56%)",
      borderRadius: "10%",
      }}>
      {card}
    </Card>
  );
}
