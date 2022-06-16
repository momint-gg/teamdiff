import {
  Box,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import Image from "next/image";
import Card from "../assets/cards/Fudge.png";
import CloseIcon from "../assets/images/close.png";
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { useEffect, useState } from "react";


export default function PlayerStateModal({
  modalOpen,
  playerName,
  handleModalClose,
}) {

  const [weeklyData, setWeeklyData] = useState([])
  const playerStatsApi = axios.create({
    baseURL: 'https://teamdiff-backend-api.vercel.app/api'
  })
  playerStatsApi.defaults.baseURL = 'https://teamdiff-backend-api.vercel.app/api'
  axiosRetry(playerStatsApi, {
    retries: 2,
    retryDelay: (count) => {
      console.log('retrying player stat api call: ' + count)
      return retryDelay * 1000
    }
  })

  useEffect(async () => {
    const { data: weeklyDataRes } = await playerStatsApi.get(`/athlete/${playerName}`)
    setWeeklyData(weeklyDataRes)
  }, [])


  return (
    // <div>hi</div>
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // minHeight: 400
        paddingTop: 5,
        paddingRight: 5,
        paddingLeft: 5,
        paddingBottom: 5
      }}
    >
      <Box className="modal-container">
        <Image src={Card} width={255*2/3} height={342*2/3} />


        <Button
          style={{ position: "absolute", top: "10px", right: "10px" }}
          onClick={handleModalClose}
        >
          <Image
            src={CloseIcon}
            width={38}
            height={38}
            sx={{ cursor: "pointer" }}
          />
        </Button>
        <TableContainer
          component={Paper}
          sx={{ marginTop: "16px", overflow: "auto", maxHeight: 280 }}
        >
          <Table>
            <TableHead sx={{ borderRadius: "16px" }}>
              <TableRow sx={{ background: "#473D3D" }}>
                <TableCell align="center">Week #</TableCell>
                <TableCell align="center">Avg Kills</TableCell>
                <TableCell align="center">Avg Deaths</TableCell>
                <TableCell align="center">Avg Assists</TableCell>
                <TableCell align="center">CSM</TableCell>
                <TableCell align="center">VSPM</TableCell>
                <TableCell align="center">FB %</TableCell>
                <TableCell align="center">Pentakills</TableCell>
                <TableCell align="center">Total Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklyData.map((week, index) => {
                // const state = stateData[key];
                return (
                  <TableRow
                    key={week.week_num.toString()}
                    sx={{ background: index % 2 ? "#473D3D" : "#8E8E8E" }}
                  >
                    <TableCell align="center">
                      <Typography> {week.week_num}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.avg_kills}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.avg_deaths || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.avg_assists || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.csm || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.vspm || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {week.fbpercent || "-"}</Typography>
                    </TableCell>
                    {/* <TableCell align="center">
                      <Typography> {week.fbpercent ? "Yes" : "No"}</Typography>
                    </TableCell> */}
                    <TableCell align="center">
                      <Typography> {week.pentakills || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: "150%", fontWeight: 500 }}> {week.points}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
}
