import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Box, Typography, Button, Chip, Container, Paper, Fab } from "@mui/material";

export default function MyLeagues({setDisplay}) {
    return (
        <Box>
          <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplay(false)}>
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
        <Typography variant="h3" color="secondary" component="div">
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
    )
}