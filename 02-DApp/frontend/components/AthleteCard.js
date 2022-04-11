import { Fragment } from "react";
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from "@mui/material"
import { useState } from 'react';

export default function AthleteCard({athleteData, setAthlete, setModalOpen}) {
  console.log(athleteData?.metadata.image)
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
            <Button size="small" color="secondary" onClick={() => {setAthlete(athleteData); setModalOpen(true)}}>View Details</Button>
          </CardActions>
        </Fragment>
      );

    return (
        <Card variant="outlined">{card}</Card>
    )
}