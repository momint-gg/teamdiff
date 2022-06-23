import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

const ViewLeagueTeamMatchup = ({
  leagueScheduleIsSet,
  week,
  setWeek,
  weeklyMatchups,
}) => {
  //   const [week, setWeek] = useState(weekNumber);

  //   const totalNumWeeks = Object.keys(weeklyMatchups).length;
  const totalNumWeeks = 7;

  const shortenAddress = (address) => {
    // console.log("address to shorten: " + address);
    const shortenedAddress1 = `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
    return shortenedAddress1;
    // setIsConnected(true);
  };
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
      {leagueScheduleIsSet ? (
        <TableContainer
          component={Paper}
          style={{ width: 800, borderRadius: 25 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#473D3D" }}>
                <TableCell align="center" colSpan={2}>
                  <Container
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    {week >= 1 && (
                      <AiOutlineArrowLeft
                        size={"1.5rem"}
                        onClick={() => setWeek((prevWeek) => prevWeek - 1)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                    <Typography fontSize={30}>Week {week + 1}</Typography>
                    {week < totalNumWeeks && (
                      <AiOutlineArrowRight
                        size={"1.5rem"}
                        onClick={() => setWeek((prevWeek) => prevWeek + 1)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </Container>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklyMatchups?.map((matchup, idx) => {
                console.log(
                  "weekly matchups: " + JSON.stringify(matchup, null, 2)
                );
                return (
                  <TableRow
                    key={
                      Object.keys(matchup[0][0]) + Object.keys(matchup[0][1])
                    }
                    sx={{ background: idx % 2 ? "#473D3D" : "#8E8E8E" }}
                  >
                    <TableCell align="center">
                      <Container
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
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
                          {shortenAddress(matchup[0][0])}
                        </Typography>
                      </Container>
                    </TableCell>
                    <TableCell align="center">
                      <Container
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography fontSize={35} sx={{ paddingLeft: 4 }}>
                          {shortenAddress(matchup[0][1])}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography textAlign={"center"}>
          Oops! Your league's schedule has not been set yet. Please request help
          in Discord if this issue persists past the end of the week.
        </Typography>
      )}
    </Container>
  );
};

export default ViewLeagueTeamMatchup;
