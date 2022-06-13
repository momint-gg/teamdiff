import { makeStyles } from "@material-ui/core";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import CloseIcon from "../assets/images/close.png";
import mystery_card from "../assets/images/mystery_card.png";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiFilledInput-input": {
      padding: "10px 30px",
      "&::placeholder": {
        color: "#8D8D8D",
      },
      color: "#000000",
    },
  },
  scrollBar: {
    "&::-webkit-scrollbar": {
      width: "8px",
      backgroundColor: "#EFEFEF",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#8D8D8D",

      // Add Border on Track
      borderLeft: "3px solid #2e2e2e",
      borderRight: "3px solid #2e2e2e",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#EFEFEF",
    },
  },
}));

export default function PlayerSelectModal({
  positionIndex,
  modalOpen,
  stateData,
  submitStarterHandler,
  players,
  selectedID,
  handleModalClose,
}) {
  const classes = useStyles();
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [selectedPlayerID, setSelectedPlayerId] = useState(selectedID);
  const positions = ["Top", "Jungle", "Mid", "Laner", "Support"];

  // console.log("selectedPlaer :" + JSON.stringify(selectedPlayer, null, 2));

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
      <Box className="modal-container" sx={{ padding: "26px 40px !important" }}>
        <Typography variant="h4" color="white">
          Select {positions[positionIndex]}
        </Typography>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            gap: "40px",
          }}
        >
          <Box sx={{ width: "70%" }}>
            <TextField
              variant="filled"
              placeholder="SEARCH"
              sx={{
                margin: "20px 0",
                width: "50%",
              }}
              className={classes.root}
              InputProps={{
                disableUnderline: true,
                style: {
                  borderRadius: "20px",
                  backgroundColor: "#EFEFEF",
                  placeholderColor: "#8D8D8D",
                },
              }}
            ></TextField>
            <Box
              className={classes.scrollBar}
              sx={{
                overflowY: "auto",
                direction: "rtl",
                height: "70%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "30px",
                  direction: "ltr",
                  marginLeft: "40px",
                }}
              >
                {players?.map((player, index) => (
                  <Box sx={{ direction: "ltr" }}>
                    <Box
                      sx={{
                        border: "2px solid",
                        borderColor:
                          player === selectedPlayer ? "#FF00FF" : "#FFFFFF",
                        borderRadius: "10px",
                        padding: "20px 40px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedPlayer(player);
                        setSelectedPlayerId(players.indexOf(player));
                      }}
                    >
                      <Image src={player.image} width={118} height={158} />
                    </Box>
                    <Typography
                      color={"white"}
                      fontSize={12}
                      sx={{ marginTop: "18px" }}
                    >
                      {player.name}
                    </Typography>
                    <Typography color={"white"} fontSize={18}>
                      {player.attributes[0].value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              marginTop: "30px",
            }}
          >
            <Image
              src={selectedPlayer ? selectedPlayer.image : mystery_card}
              width={255}
              height={342}
            />
            <Button
              onClick={() =>
                submitStarterHandler(selectedPlayerID, positionIndex)
              }
              style={{
                background:
                  "linear-gradient(135deg, #00FFFF 0%, #FF00FF 0.01%, #480D48 100%)",
                borderRadius: "50px",
                padding: "10px 30px",
                fontWeight: "600",
                marginTop: "20px",
                fontSize: "20px",
              }}
            >
              START ATHLETE
            </Button>
            <Box
              sx={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box>
                  <Typography
                    color={"white"}
                    fontSize={18}
                    fontWeight={300}
                    align="left"
                  >
                    TEAM
                  </Typography>
                  <Typography color={"white"} fontSize={24} align="left">
                    {selectedPlayer
                      ? selectedPlayer.attributes[0].value
                      : "none"}
                  </Typography>
                </Box>
                <Box sx={{ marginTop: "20px" }}>
                  <Typography
                    color={"white"}
                    fontSize={18}
                    fontWeight={300}
                    align="left"
                  >
                    OPPONENT
                  </Typography>
                  <Typography color={"white"} fontSize={24} align="left">
                    {selectedPlayer ? "c69" : "none"}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Box>
                  <Typography
                    color={"white"}
                    fontSize={18}
                    fontWeight={300}
                    align="left"
                  >
                    POSITION
                  </Typography>
                  <Typography color={"white"} fontSize={24} align="left">
                    {selectedPlayer
                      ? selectedPlayer.attributes[1].value
                      : "none"}
                  </Typography>
                </Box>
                <Box sx={{ marginTop: "20px" }}>
                  <Typography
                    color={"white"}
                    fontSize={18}
                    fontWeight={300}
                    align="left"
                  >
                    PREVIOUS POINTS
                  </Typography>
                  <Typography color={"white"} fontSize={24} align="left">
                    {selectedPlayer ? "69" : "none"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
