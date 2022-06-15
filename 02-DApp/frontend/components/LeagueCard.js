import { Box, Card, CardContent, Typography } from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
// Router
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";

// export default function LeagueCard({ leagueAddress, setMountedLeagueAddress, setLeague, setLeagueOpen }) {
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
  const [leagueSize, setLeagueSize] = useState(1);

  useEffect(() => {
    // console.log("leagueADdy: " + leagueAddress)
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
      <CardContent>
        {/* <Avatar
          alt="League Image"
          src={leagueData?.image?.examplePic.src}
          sx={{ bgcolor: "white", position: "absolute" }}
        /> */}
        <Box sx={{ marginLeft: 2 }}>
          <Typography variant="h5" color="secondary" component="div">
            {leagueName || "(Untitled)"}
          </Typography>

          <Typography variant="body1" color="inherit">
            {leagueAddress}
          </Typography>
          <Typography variant="body1" color="inherit">
            {leagueSize + " /8"}
          </Typography>
          {/* <Typography variant="body1" color="inherit">
            Your current standing: {leagueData?.standing}
          </Typography> */}
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
    <Card variant="outlined" onClick={handleClick}>
      {/* <Link href= {"/leagues/" + leagueAddress}> */}
      {card}
      {/* </Link> */}
    </Card>
  );
}
