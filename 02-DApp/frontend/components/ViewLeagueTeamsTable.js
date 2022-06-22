import { Container, TableContainer, Table, TableHead, TableRow, TableCell, Typography, Paper, TableBody } from '@mui/material'

// fake data - data structure is a best guess at what contract data is formatted as
// const teamNames = [
//     "reggie",
//     "trey",
//     "will",
//     "henry",
//     "katie",
//     "zach"
// ] 

// const teamRecords = [
//     "9-2-1",
//     "9-2-1",
//     "9-2-1",
//     "9-2-1",
//     "9-2-1",
//     "9-2-1"   
// ]

// const weeklyMatchups = {
//     1: [{
//         "reggie": 2,
//         "trey": 2
//     },
//     {
//         "katie": 2,
//         "reggie": 3
//     }],
//     2: [{
//         "katie": 2,
//         "reggie": 3
//     },
//     {
//         "reggie": 2,
//         "trey": 2
//     }],
//     2: [{
//         "zach": 2,
//         "will": 3
//     },
//     {
//         "henry": 2,
//         "trey": 5
//     }]
// }

// const leagueName = "WashU Esports"

const ViewLeagueTeamsTable = ({ leagueName, teamNames, teamRecords }) => {
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
            {leagueName}
        </Typography>

        <TableContainer component={Paper} style={{ width: 800, borderRadius: 25 }}>
                <Table >
                <TableHead>
                    <TableRow sx={{ background: "#473D3D" }}>
                        <TableCell align="center">
                            <Typography fontSize={30}>
                                Team 
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography fontSize={30}>
                                Record 
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teamNames.map((team, idx) => {
                        const record = teamRecords[idx]
                        return (
                            <TableRow 
                            key={team}
                            sx={{ background: idx % 2 ? "#473D3D" : "#8E8E8E" }}
                            >
                                <TableCell align="center">
                                    <Typography fontSize={30}>
                                        {team}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography fontSize={30}>
                                        {record}
                                    </Typography>
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

export default ViewLeagueTeamsTable