import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import {
  Box,
  Button,
  Container,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
} from "@mui/material";
import { makeStyles } from "@material-ui/core";
import LogoIcon from "../assets/images/logoIcon.png";

const useStyles = makeStyles({
  cell: {
    fontSize: 36,
  },
});

const userData = [
  {
    ens: "willhunter.eth",
    wins: 9,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
  {
    ens: "willhunter.eth",
    wins: 1,
    losses: 2,
    ties: 1,
  },
];

const matchups = {
  week1: {
    number: 1,
    matches: [
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
    ],
  },
  week2: {
    number: 2,
    matches: [
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
    ],
  },
  week3: {
    number: 3,
    matches: [
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 2,
        },
      },
    ],
  },
  week4: {
    number: 4,
    matches: [
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
      {
        team1: {
          ens: "willhunter.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
        team2: {
          ens: "reggiecai.eth",
          wins: 1,
          losses: 3,
          ties: 1,
          thisWeekPoints: 3,
        },
      },
    ],
  },
};

export default function League() {
  const classes = useStyles();
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(matchups.week3);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        color="white"
        component="div"
        sx={{
          fontSize: 64,
        }}
      >
        WashU Esports
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderTopRightRadius: "16px", borderTopLeftRadius: "16px" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#473D3D" }}>
              <TableCell className={classes.cell} align="center">
                Team Name
              </TableCell>
              <TableCell align="center" className={classes.cell}>
                Record
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData.map((data, index) => (
              <TableRow
                key={index.toString()}
                sx={{
                  background: index % 2 ? "#473D3D" : "#8E8E8E",
                  cursor: "pointer",
                }}
                onClick={() => router.push("myTeam")}
              >
                <TableCell align="center">
                  <Typography fontSize={30}> {data.ens}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize={30} fontWeight={"bold"} align="center">
                    {data.wins}-{data.losses}-{data.ties}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography
        color="white"
        fontSize={64}
        sx={{
          marginTop: "75px",
        }}
      >
        Matchups
      </Typography>
      <Box container sx={{ color: "white", borderRadius: "16px" }}>
        <Box
          sx={{
            background: "#473D3D",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            padding: "10px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() =>
              setSelectedWeek((prev) =>
                prev.number - 1 > 0 ? matchups[`week${prev.number - 1}`] : prev
              )
            }
          >
            <IoIosArrowBack size={30} />
          </Button>
          <Typography fontSize={30} align="center">
            Week {selectedWeek.number}
          </Typography>
          <Button
            onClick={() =>
              setSelectedWeek((prev) =>
                prev.number + 1 < 5 ? matchups[`week${prev.number + 1}`] : prev
              )
            }
          >
            <IoIosArrowForward size={30} />
          </Button>
        </Box>
        <Grid container>
          {selectedWeek?.matches.map((match, index) => (
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                color: "white",
                width: "100%",
                background: index % 2 ? "#473D3D" : "#8E8E8E",
                gap: "60px",
                cursor: "pointer",
              }}
              onClick={() => router.push("matchups")}
            >
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
                xs={6}
              >
                <Box>
                  <Typography fontSize={28}>{match.team1.ens}</Typography>
                  <Typography fontSize={16}>
                    {match.team1.wins}-{match.team1.losses}-{match.team1.ties}
                  </Typography>
                </Box>
                <Typography fontSize={30} fontWeight="bold" marginLeft={"16px"}>
                  {match.team1.thisWeekPoints}
                </Typography>
                <Image src={LogoIcon} alt="logo" width={50} height={50} />
              </Grid>
              <Grid sx={{ display: "flex", alignItems: "center" }} xs={6}>
                <Typography fontSize={30} fontWeight="bold">
                  {match.team2.thisWeekPoints}
                </Typography>
                <Image src={LogoIcon} alt="logo" width={50} height={50} />
                <Box sx={{ marginLeft: "16px" }}>
                  <Typography fontSize={28}>{match.team2.ens}</Typography>
                  <Typography fontSize={16}>
                    {match.team1.wins}-{match.team2.losses}-{match.team1.ties}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
