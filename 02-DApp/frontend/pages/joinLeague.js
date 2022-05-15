import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Fab,
} from "@mui/material";
import JoinCard from "../components/JoinCard";

export default function JoinLeague({ setDisplay }) {
  const exampleWhitelisted = {
    leagueName: "Friends League",
    invitedBy: "reggiecai",
  };
  const examplePublic = {
    leagueName: "Fun League",
    publicOwner: "elon",
  };
  return (
    <Box>
      <Fab
        variant="extended"
        size="small"
        aria-label="add"
        onClick={() => setDisplay(false)}
      >
        &#60; BACK
      </Fab>

      <Typography variant="h3" color="secondary" component="div" marginTop={2}>
        YOUR WHITELISTED LEAGUES
      </Typography>
      <hr
        style={{
          color: "white",
          backgroundColor: "secondary",
          height: 5,
        }}
      />
      <JoinCard joinData={exampleWhitelisted} />
      <Typography variant="h3" color="secondary" component="div" marginTop={5}>
        PUBLIC LEAGUES
      </Typography>
      <hr
        style={{
          color: "white",
          backgroundColor: "secondary",
          height: 5,
        }}
      />
      <JoinCard joinData={examplePublic} />
    </Box>
  );
}
