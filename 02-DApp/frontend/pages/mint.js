import {
  useAccount,
  useConnect,
  useContractRead,
  useContract,
  useEnsLookup,
} from "wagmi";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
} from "@mui/material";
import ConnectWalletModal from "../components/ConnectWalletModal";

export default function Mint({ setDisplay }) {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [modalOpen, setModalOpen] = useState(false);

  if (true) {
    return (
      <Box>
        <Fab
          variant="extended"
          size="small"
          color="primary"
          aria-label="add"
          onClick={() => setDisplay(false)}
        >
          &#60; BACK
        </Fab>
        <Container maxWidth="lg" justifyContent="center" alignItems="center">
          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 260,
                height: 350,
              },
            }}
          >
            <Paper
              elevation={0}
              style={{
                background:
                  "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                filter: "blur(35px)",
                marginBottom: "2rem"
              }}
            />
            <img src="/starter-pack.png" style={{ position: "absolute" }} />
          </Box>

          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
            }}
          >
            <Typography variant="h2" color="white" component="div">
              Mint Starter Pack
            </Typography>
          </Box>
          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
              paddingTop: "20px",
            }}
          >
            <Button
              variant="contained"
              color="inherit"
              style={{ color: "black", borderRadius: "40px", fontSize: 20 }}
              onClick={() => {
                if (!accountData) {
                  setModalOpen(true);
                }
              }}
            >
              {accountData ? "MINT" : "CONNECT WALLET TO MINT"}
            </Button>
            {modalOpen && (
              <ConnectWalletModal
                modalOpen={modalOpen}
                handleClickAway={null}
                setModalOpen={setModalOpen}
              />
            )}
          </Box>
        </Container>
      </Box>
    );
  }
}
