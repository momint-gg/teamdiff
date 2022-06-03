import React, { useState } from "react";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useMediaQuery } from "react-responsive";
import logo from "../assets/images/player.png";
import PlayerStateModal from "../components/PlayerStateModal";
import PlayerSelectModal from "../components/PlayerSelectModal";
import Card from "../assets/cards/Fudge.png";
import Sample from "../../backend/sample.json";

const atheleteData = Sample.athleteData;

// TODO get data from backend
const players = [
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
  {
    name: "TRADING CARD",
    title: "Darshan 2022",
    image: Card,
  },
];

export default function MyTeam() {
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const useStyles = makeStyles({
    cell: {
      fontSize: 36,
    },
  });
  const classes = useStyles();
  const [currentPlayer, setCurrentPlayer] = useState({});
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  const handleStateModal = (player) => {
    setCurrentPlayer(player);
    setStateModalOpen(true);
  };

  const handleSubModal = (player) => {
    setCurrentPlayer(player);
    setSubModalOpen(true);
  };

  const handleStateModalClose = () => {
    setStateModalOpen(false);
    setSubModalOpen(false);
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        color="white"
        component="div"
        sx={{
          fontSize: 64,
        }}
      >
        WashU Esports - My Team
      </Typography>
      <Typography
        color="white"
        component="div"
        sx={{
          fontSize: 36,
        }}
      >
        Week 3: Roster Locks in 2 Days
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#473D3D" }}>
              <TableCell className={classes.cell} align="center">
                Position
              </TableCell>
              <TableCell align="center" className={classes.cell}>
                Player
              </TableCell>
              <TableCell align="center" className={classes.cell}>
                Previous Points
              </TableCell>
              <TableCell align="center" className={classes.cell}>
                Opponent
              </TableCell>
              <TableCell align="center" className={classes.cell}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(atheleteData).map((key, index) => {
              const athelete = atheleteData[key];
              return (
                <TableRow
                  key={index.toString()}
                  sx={{ background: index % 2 ? "#473D3D" : "#8E8E8E" }}
                >
                  <TableCell align="center">
                    <Typography fontSize={30}> {athelete.position}</Typography>
                  </TableCell>
                  <TableCell sx={{ display: "flex" }} align="center">
                    <Image src={logo} />
                    <div>
                      <Typography
                        fontSize={30}
                        onClick={() => handleStateModal(athelete)}
                      >
                        {athelete.name || ""}
                      </Typography>
                      <Typography component="div">{athelete.score}</Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div>
                      <Typography fontSize={30}>
                        {athelete.prevPoints}
                      </Typography>
                      <Typography>{athelete.vs}</Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div>
                      <Typography fontSize={30} textTransform="uppercase">
                        {athelete.opponent}
                      </Typography>
                      <Typography>{athelete.gameDate}</Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleSubModal(athelete)}
                      style={{
                        background:
                          "linear-gradient(135deg, #00FFFF 0%, #FF00FF 0.01%, #480D48 100%)",
                        borderRadius: "50px",
                        padding: "10px 40px",
                        fontWeight: "600",
                        fontSize: "20px",
                      }}
                    >
                      SUB
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <PlayerStateModal
        modalOpen={stateModalOpen}
        stateData={Sample.statsData}
        handleModalClose={handleStateModalClose}
      />
      <PlayerSelectModal
        modalOpen={subModalOpen}
        stateData={currentPlayer}
        players={players}
        handleModalClose={handleStateModalClose}
      />
    </Container>
  );
}
