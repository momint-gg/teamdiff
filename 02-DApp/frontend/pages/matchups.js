import React, { useState } from "react";
import Image from "next/image";
import { Container, Typography, Box, Grid } from "@mui/material";
import PlayerStateModal from "../components/PlayerStateModal";
import LogoIcon from "../assets/images/logoIcon.png";
import Sample from "../../backend/sample.json";

const statsData = Sample.statsData;

const data = {
  first: {
    ens: "reg.eth",
    wins: 3,
    athleteData: [
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "TOP",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "JG",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "MID",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "SUP",
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
        position: "ADC",
      },
    ],
  },
  second: {
    ens: "will.eth",
    wins: 2,
    athleteData: [
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
      {
        name: "Faker",
        cs: 100,
        opponent: "C9",
        prevPoints: 30,
      },
    ],
  },
};

export default function Matchups() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = (athelete) => {
    setModalOpen(true);
  };

  const handleStateModalClose = () => {
    setModalOpen(false);
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
          fontSize: "64px",
        }}
      >
        WashU Esports
      </Typography>
      <Typography
        color="white"
        sx={{
          fontSize: "36px",
        }}
      >
        Week 3: Roster Locked
      </Typography>
      <Box
        sx={{
          background: "#473D3D",
          borderRadius: "16px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography color={"white"} fontSize={48}>
              reggiecai.eth
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography color={"white"} fontSize={64} fontWeight="700">
                3
              </Typography>
              <Image src={LogoIcon} alt="logo image" width={62} height={62} />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography color={"white"} fontSize={48}>
              willhunter.eth
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography color={"white"} fontSize={64} fontWeight="700">
                2
              </Typography>
              <Image src={LogoIcon} alt="logo image" width={62} height={62} />
            </Box>
          </Box>
        </Box>
        <Grid>
          {data.first.athleteData.map((athlete) => (
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                color: "white",
                borderTop: "2px solid #FFFFFF",
              }}
            >
              <Grid item xs={1} textAlign="center">
                <Image src={LogoIcon} alt="logo" width={50} height={50} />
              </Grid>
              <Grid
                item
                textAlign="center"
                onClick={() => handleModalOpen(athlete)}
                sx={{ cursor: "pointer" }}
              >
                <Typography fontSize={48}>{athlete.name}</Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography fontSize={30} fontWeight={700}>
                  {athlete.cs}T
                </Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography>Loss vs {athlete.opponent}</Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography color="#D835D8" fontSize={48}>
                  {athlete.prevPoints}
                </Typography>
              </Grid>
              <Grid item xs={1.5} textAlign="center">
                <Typography
                  fontSize={48}
                  sx={{
                    borderLeft: "1px solid #FFFFFF",
                    borderRight: "1px solid #FFFFFF",
                  }}
                >
                  {athlete.position}
                </Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography color="#D835D8" fontSize={48}>
                  {athlete.prevPoints}
                </Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography>Loss vs {athlete.opponent}</Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Typography fontSize={30} fontWeight={700}>
                  {athlete.cs}T
                </Typography>
              </Grid>
              <Grid
                item
                textAlign="center"
                onClick={() => handleModalOpen(athlete)}
                sx={{ cursor: "pointer" }}
              >
                <Typography fontSize={48}>{athlete.name}</Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <Image src={LogoIcon} alt="logo" width={50} height={50} />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
      <PlayerStateModal
        modalOpen={modalOpen}
        stateData={statsData}
        handleModalClose={handleStateModalClose}
      />
    </Container>
  );
}
