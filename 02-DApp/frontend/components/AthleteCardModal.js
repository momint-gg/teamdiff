import { useAccount, useDisconnect
, useConnect } from "wagmi";
import {
  Box,
  Button,
  Avatar,
  CardMedia,
  Typography,
  Modal,
} from "@mui/material";

export default function AthleteCardModal({
  modalOpen,
  athleteData,
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
      <Box
        sx={{
          position: "absolute",
          borderTop: "10%",
          borderLeft: "10%",
          width: "50%",
          height: "75%",
          backgroundColor: "primary.charcoal",
          boxShadow: 24,
          borderRadius: "10%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 8,
        }}
      >
        <Typography fontSize={30}>{athleteData?.title}</Typography>
        <CardMedia
          component="img"
          height="400"
          image={athleteData?.metadata.image}
          alt="NFT Image"
        />
        <Typography variant="title" color="inherit" noWrap>
          &nbsp;
        </Typography>
        <Typography variant="body1" color="inherit">
          {athleteData?.description}
        </Typography>
      </Box>
    </Modal>
  );
}
