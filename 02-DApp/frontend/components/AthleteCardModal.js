import {
  Box,
  Button,
  Avatar,
  CardMedia,
  Typography,
  Modal
} from "@mui/material";
import { IoCloseOutline } from "react-icons/io5";

export default function AthleteCardModal({
  modalOpen,
  image,
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
          height: "90%",
          minWidth: 450,
          backgroundColor: "primary.main",
          boxShadow: 24,
          borderRadius: "10%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 2,
        }}
      >
        <Button
          style={{ position: "absolute", top: "10px", right: "10px" }}
          onClick={handleModalClose}
        >
          <IoCloseOutline
            size={"3rem"}
            onClick={() => {
              handleModalClose()
            }}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: "5px",
              top: "5px",
              color: "black"
            }}
          />
        </Button>
        <Typography fontSize={30}>{athleteData?.title}</Typography>
        <CardMedia
          component="img"
          height="400"
          image={image}
          alt="NFT Image"
          sx={{
            objectFit: "contain"
          }}
        />
        {/* <Typography variant="title" color="inherit" noWrap>
          &nbsp;
        </Typography> */}
        <Typography variant="body1" color="inherit" sx={{
          pl: 5,
          pr: 5,
          textAlign: "center"
        }}>
          {athleteData?.description}
        </Typography>
      </Box>
    </Modal>
  );
}
