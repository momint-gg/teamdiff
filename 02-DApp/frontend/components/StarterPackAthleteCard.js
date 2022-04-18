import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

export default function StarterPackAthleteCard(athleteData) {
  const card = (
    <Fragment>
      <CardContent>
        <Typography variant="h5" color="secondary" component="div">
          {athleteData?.athleteData.title}
        </Typography>
        <CardMedia
          component="img"
          height="400"
          image={"https://ipfs.io/ipfs/" + athleteData?.athleteData.image}
          alt="NFT Image"
        />
        <Typography variant="title" color="inherit" noWrap>
          &nbsp;
        </Typography>
        <h3>{athleteData?.athleteData.name}</h3>
        <Typography variant="body1" color="inherit">
          {athleteData?.athleteData.attributes[0].value}
        </Typography>
        <Typography variant="body1" color="inherit">
          {athleteData?.athleteData.attributes[1].value}
        </Typography>
      </CardContent>
      {/* <CardActions>
            <Button size="small" color="secondary">View Details</Button>
          </CardActions> */}
    </Fragment>
  );

  return <Card variant="outlined">{card}</Card>;
}
