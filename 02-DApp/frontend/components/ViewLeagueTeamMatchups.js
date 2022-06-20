import { Container, TableContainer, Table, TableHead, TableRow, TableCell, Typography, Paper, TableBody } from '@mui/material'
import { useState } from 'react'

const ViewLeagueTeamMatchup = ({ weekNumber, weeklyMatchups }) => {
    const [week, setWeek] = useState(weekNumber)

    return (
        <Container
        sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        }}
    >
        <Typography
            variant="h4"
            color="white"
            component="div"
            sx={{
                fontSize: 64,
            }}
            >
            Matchups
        </Typography>

        <TableContainer component={Paper} style={{ width: 800, borderRadius: 25 }}>
            <Table >
                <TableHead>
                    <TableRow sx={{ background: "#473D3D" }}>
                        <TableCell align="center" colSpan={2}>
                            <Typography fontSize={30}>
                                Week {week} 
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {weeklyMatchups[week].map((matchup, idx) => {
                        return (
                            <TableRow 
                            key={Object.keys(matchup)[0] + Object.keys(matchup)[1]}
                            sx={{ background: idx % 2 ? "#473D3D" : "#8E8E8E" }}
                            >
                                <TableCell align="center">
                                    <Container
                                        sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center"
                                        }}
                                    >
                                        <Container
                                            sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            }}
                                        >
                                            <Typography fontSize={25}>
                                                {Object.keys(matchup)[0]}
                                            </Typography>
                                            <Typography fontSize={15}>
                                                {"[Insert team record here]"}
                                            </Typography>
                                        </Container>
                                        <Typography fontSize={35} sx={{ paddingRight: 4 }}>
                                            {matchup[Object.keys(matchup)[0]]}
                                        </Typography>
                                    </Container>
                                </TableCell>
                                <TableCell align="center">
                                    <Container
                                            sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center"
                                            }}
                                    >
                                        <Typography fontSize={35} sx={{ paddingLeft: 4 }}>
                                            {matchup[Object.keys(matchup)[1]]}
                                        </Typography>
                                        <Container
                                            sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            }}
                                        >
                                            <Typography fontSize={25}>
                                                {Object.keys(matchup)[1]}
                                            </Typography>
                                            <Typography fontSize={15}>
                                                {"[Insert team record here]"}
                                            </Typography>
                                        </Container>
                                    </Container>
                                </TableCell>
                            </TableRow>
                        )
                    })}

                </TableBody>

            </Table>
        </TableContainer>
    </Container>
    )
}

export default ViewLeagueTeamMatchup