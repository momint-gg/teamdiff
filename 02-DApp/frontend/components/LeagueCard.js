import { Fragment } from "react";
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Avatar, Box } from "@mui/material"

export default function LeagueCard({leagueData, setLeague, setLeagueOpen}) {
    const card = (
        <Fragment>
          <CardContent>
            <Avatar alt="League Image" src={leagueData?.image?.examplePic.src} sx={{ bgcolor: "white", position: "absolute" }}/>
            <Box sx={{marginLeft: 6}}>
            <Typography variant="h5" color="secondary" component="div">
                {leagueData?.leagueName}
            </Typography>

            <Typography variant="body1" color="inherit">
                Your current standing: {leagueData?.standing}
            </Typography>
            </Box>
          </CardContent>
        </Fragment>
      );

    return (
        <Card variant="outlined" onClick={() => {setLeague(leagueData); setLeagueOpen(true)}}>{card}</Card>
    )
}