import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Box, Typography } from '@mui/material'

export default function Footer() {
    return (
        <Box backgroundColor='primary.dark' padding={2}>
            <hr
                style={{
                    color: "white",
                    backgroundColor: "white",
                    height: 5,
                }}
            />
            <Typography color="white" component="div">
                © 2022 TeamDiff LLC
            </Typography>
        </Box>
    )
}