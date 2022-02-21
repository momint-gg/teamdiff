import { Fragment } from "react";
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from "@mui/material"
  

export default function AthleteCard(athleteData) {
    const card = (
        <Fragment>
          <CardContent>
            <Typography variant="h5" color="secondary" component="div">
                {athleteData?.athleteData.title}
            </Typography>
            <CardMedia
                component="img"
                height="400"
                image={athleteData?.athleteData.metadata.image}
                alt="NFT Image"
            />
            <Typography variant="title" color="inherit" noWrap>
                &nbsp;
            </Typography>
            <Typography variant="body1" color="inherit">
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