import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Link
} from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
import Image from "next/image";
// Router
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json";
import logo from "../assets/images/logoIcon.png";

export default function LeagueCard({ leagueAddress }) {
  // Router
  const router = useRouter();

  // TODO change to matic network for prod
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
  );
  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [weekNum, setWeekNum] = useState(null);
  const [leagueSize, setLeagueSize] = useState(1);

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
        setLeagueName(leagueName);
        const weekNum = await LeagueProxyContract.currentWeekNum();
        setWeekNum(parseInt(weekNum) + 1);
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
    <CardActionArea
      // focusHighlight={{
      //   opacity: 0,
      //   backgroundColor: "brown",
      // }}
      href={"/leagues/" + leagueAddress}
    >
      <Fragment>
        {/* <CardActionArea onClick={handleClick}> */}
        <CardHeader
          sx={{
            background: "#343434 !important",
            p: "15%",
            height: "3rem",
            borderBottom: "solid white 0.01rem",
            minWidth: "15rem",
          }}
          // onClick={handleClick}
          title={leagueName || "(Untitled)"}
          subheader={"WEEK " + weekNum}
        ></CardHeader>
        {/* </CardActionArea> */}
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Link
              href={"./leagues/" + leagueAddress + "/myTeam"}
              fontSize={18}
              fontWeight={"bold"}
              variant="body1"
              color="secondary"
            >
              MY TEAM
              <Image src={logo} alt="logo" width="30px" height="30px" />
            </Link>
            <Link
              href={"./leagues/" + leagueAddress + "/home"}
              fontSize={18}
              fontWeight={"bold"}
              variant="body1"
              color="secondary"
            >
              VIEW LEAGUE
              <Image src={logo} alt="logo" width="30px" height="30px" />
            </Link>
            {/* <Box
              component="div"
              sx={{
                wordWrap: "break-word",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  fontSize={20}
                  fontWeight={"bold"}
                  variant="body1"
                  color="inherit"
                >
                  Willhunter.eth
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <Typography
                    fontSize={20}
                    fontWeight={"bold"}
                    variant="body1"
                    color="inherit"
                  >
                    3
                  </Typography>
                  <Image src={logo} alt="logo" width="30px" height="30px" />
                </Box>
              </Box>
              <Typography
                fontSize={14}
                fontStyle={"italic"}
                variant="body1"
                color="inherit"
              >
                {"Record: 0 - 1 - 1"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  noWrap
                  maxWidth="10rem"
                  fontSize={20}
                  fontWeight={"bold"}
                  variant="body1"
                  color="inherit"
                >
                  reggiecailonglong.eth
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <Typography
                    fontSize={20}
                    fontWeight={"bold"}
                    variant="body1"
                    color="inherit"
                  >
                    2
                  </Typography>
                  <Image src={logo} alt="logo" width="30px" height="30px" />
                </Box>
              </Box>
              <Typography
                fontSize={14}
                fontStyle={"italic"}
                variant="body1"
                color="inherit"
              >
                {"Record: 1 - 0 - 1"}
              </Typography>
              <Divider
                sx={{ marginTop: 5, marginBottom: "-6%" }}
                variant="middle"
                color="white"
              /> */}
          </Box>
        </CardContent>
      </Fragment>
    </CardActionArea>
  );

  const handleClick = (e) => {
    e.preventDefault();
    const href = "/leagues/" + leagueAddress;
    router.push(href);
  };

  return (
    <Card
      variant="outlined"
      // onClick={handleClick}
      sx={{
        background:
          "linear-gradient(124.78deg, rgba(47, 13, 50, 0.75) 6.52%, rgba(116, 14, 122, 0.75) 78.06%, rgba(0, 255, 255, 0.75) 168.56%)",
        borderRadius: "10%",
      }}
    >
      {/* <Link href= {"/leagues/" + leagueAddress}> */}
      {card}
      {/* </Link> */}
    </Card>
  );
}
