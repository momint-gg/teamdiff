import Image from "next/image";
import {
  Box,
  Button,
  Typography,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
} from "@mui/material";
import CloseIcon from "../assets/images/close.png";
import Card from "../assets/cards/Fudge.png";

export default function PlayerStateModal({
  modalOpen,
  stateData,
  handleModalClose,
}) {
  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box className="modal-container">
        <Image src={Card} width={255} height={342} />
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
          sx={{ marginTop: "16px", overflow: "auto" }}
        >
          <Table>
            <TableHead sx={{ borderRadius: "16px" }}>
              <TableRow sx={{ background: "#473D3D" }}>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Opponent</TableCell>
                <TableCell align="center">Kills</TableCell>
                <TableCell align="center">Deaths</TableCell>
                <TableCell align="center">Assists</TableCell>
                <TableCell align="center">CS</TableCell>
                <TableCell align="center">Team Win</TableCell>
                <TableCell align="center">Total Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(stateData).map((key, index) => {
                const state = stateData[key];
                return (
                  <TableRow
                    key={index.toString()}
                    sx={{ background: index % 2 ? "#473D3D" : "#8E8E8E" }}
                  >
                    <TableCell align="center">
                      <Typography> {state.gameDate}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.opponent}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.kills || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.deaths || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.assists || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.cs || "-"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.teamWin ? "Yes" : "No"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography> {state.totalPoints}</Typography>
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
