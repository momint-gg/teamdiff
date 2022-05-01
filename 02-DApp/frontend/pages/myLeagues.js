import { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
} from "@mui/material";
import examplePic from "../assets/images/jinx.webp";
import LeagueCard from "../components/LeagueCard";
import LeagueDetails from "./leagueDetails";

export default function MyLeagues({ setDisplay }) {
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [currLeague, setCurrLeague] = useState(null);

  const exampleData = {
    leagueName: "Jinxers",
    image: { examplePic },
    standing: "2 of 8",
  };
  return (
    <Box>
      {!leagueOpen && (
        <Box>
          <Fab
            variant="extended"
            size="small"
            color="primary"
            aria-label="add"
            onClick={() => setDisplay(false)}
          >
            &#60; BACK
          </Fab>

          <Typography variant="h3" color="secondary" component="div">
            ACTIVE LEAGUES
          </Typography>
          <hr
            style={{
              color: "secondary",
              backgroundColor: "secondary",
              height: 5,
            }}
          />
          <LeagueCard
            leagueData={exampleData}
            setLeague={setCurrLeague}
            setLeagueOpen={setLeagueOpen}
          />
          <Typography
            variant="h3"
            color="secondary"
            component="div"
            sx={{ marginTop: 5 }}
          >
            PENDING LEAGUES
          </Typography>
          <hr
            style={{
              color: "secondary",
              backgroundColor: "secondary",
              height: 5,
            }}
          />
        </Box>
      )}
      {leagueOpen && (
        <LeagueDetails leagueData={currLeague} setLeagueOpen={setLeagueOpen} />
      )}
    </Box>
  );
}
