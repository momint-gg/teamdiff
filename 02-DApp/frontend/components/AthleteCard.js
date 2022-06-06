import {
  Button, Card, CardActions, CardContent,
  CardMedia,
  Typography
} from "@mui/material";
import React, { Fragment } from "react";

export default function AthleteCard({ athleteData, setAthlete, setModalOpen }) {
  //console.log("Athlete Data:" + athleteData);
  const card = (
    <Fragment>
      <CardContent>
        <Typography variant="h5" color="secondary" component="div">
          {athleteData?.title}
        </Typography>
        <CardMedia
          component="img"
          height="400"
          image={athleteData?.metadata.image}
          alt="NFT Image"
        />
        <Typography variant="title" color="inherit" noWrap>
          &nbsp;
        </Typography>
        <Typography variant="body1" color="inherit">
          {athleteData?.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="secondary"
          onClick={() => {
            setAthlete(athleteData);
            setModalOpen(true);
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Fragment>
  );

  return <Card variant="outlined">{card}</Card>;
}
