/* eslint-disable react/no-unescaped-entities */
import { Box, Card, Typography } from "@mui/material";
import React from "react";
import { useMediaQuery } from "react-responsive";
import WalletLogin from "./WalletLogin";
<<<<<<< HEAD
<<<<<<< HEAD
import { useMediaQuery } from "react-responsive";
=======
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

export default function ConnectWalletPrompt({ accessing }) {
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Card
        sx={{ textAlign: "center", padding: 3, color: "white", width: "30rem" }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Connect
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1.1rem",
            marginTop: ".4rem",
            marginBottom: ".4rem",
            overflowWrap: "break-word",
          }}
        >
          Whether it's your first time visiting, or you're a returning pro, make
<<<<<<< HEAD
<<<<<<< HEAD
          sure to connect your wallet to access{" "}
          {accessing ? accessing : "TeamDiff"}.
=======
          sure to connect your wallet to access {accessing || "TeamDiff"}.
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
          sure to connect your wallet to access{" "}
          {accessing ? accessing : "TeamDiff"}.
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
        </Typography>
        <WalletLogin isMobile={isMobile} />
      </Card>
    </Box>
  );
}
