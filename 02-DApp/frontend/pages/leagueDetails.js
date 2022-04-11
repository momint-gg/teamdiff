import { Fragment } from "react";
import { Card, Fab, Paper, Typography, CardActions, Button, Avatar, Box, Grid } from "@mui/material"
import { useState } from 'react';

export default function LeagueDetails({leagueData, setLeagueOpen}) {


    return (
        <Box>
            <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => {setLeagueOpen(false)}}>
                &#60; BACK
            </Fab>
            <Avatar alt="League Image" src={leagueData?.image?.examplePic.src} sx={{ bgcolor: "white", position: "absolute"}}/>
            <Box sx={{marginLeft: 6}}>
            <Typography variant="h2" color="secondary" component="div">
                {leagueData?.leagueName}
            </Typography>

            <Typography variant="body1" color="white">
                Your current standing: {leagueData?.standing}
            </Typography>

            <Typography variant="h4" color="secondary" component="div" sx={{marginTop: 5}}>
                SET YOUR LINEUP!
            </Typography>

            <Grid container spacing={5}>
                <Grid item>
                <Paper
                elevation={0}
                style={{
                    background:
                    'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                    width: 150,
                    height: 200
                }}
                />
                </Grid>
                <Grid item>
                <Paper
                elevation={0}
                style={{
                    background:
                    'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                    width: 150,
                    height: 200
                }}
                />
                </Grid>
                <Grid item>
                <Paper
                elevation={0}
                style={{
                    background:
                    'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                    width: 150,
                    height: 200
                }}
                />
                </Grid>
                <Grid item>
                <Paper
                elevation={0}
                style={{
                    background:
                    'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                    width: 150,
                    height: 200
                }}
                />
                </Grid>
                <Grid item>
                <Paper
                elevation={0}
                style={{
                    background:
                    'linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)',
                    width: 150,
                    height: 200
                }}
                />
                </Grid>
            </Grid>
            </Box>
        </Box>
    )
}