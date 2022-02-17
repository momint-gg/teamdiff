import { Fragment } from "react";
import { Card, CardContent, Typography, CardActions, Button } from "@mui/material"
  

export default function AthleteCard(athleteData) {
    const card = (
        <Fragment>
          <CardContent>
            <Typography variant="h5" color="secondary" component="div">
                {athleteData?.athleteData.title}
            </Typography>
            <img src={athleteData?.athleteData.metadata.image} alt="NFT" />
            <Typography variant="body2">
                {athleteData?.athleteData.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="secondary">View Details</Button>
          </CardActions>
        </Fragment>
      );

    return (
        <Card variant="outlined">{card}</Card>
    )
}