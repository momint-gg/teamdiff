<<<<<<< HEAD
import { Typography, Box, Card } from "@mui/material";
=======
import { Box, Card, Typography } from "@mui/material";
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
import PacmanLoader from "react-spinners/PacmanLoader";

export default function LoadingPrompt({ loading, bottomText, completeTitle }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Card
        sx={{ textAlign: "center", padding: 3, color: "white", width: "30rem" }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
<<<<<<< HEAD
          {completeTitle ? completeTitle : `Loading ${loading}`}
=======
          {completeTitle || `Loading ${loading}`}
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
        </Typography>
        <Box
          sx={{ padding: 3, paddingBottom: 8, marginTop: 0, marginRight: 10 }}
        >
          <PacmanLoader color={"#aa10ad"} size={30} margin={2} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1.1rem",
            marginTop: "1rem",
            marginBottom: ".4rem",
            overflowWrap: "break-word",
          }}
        >
          {bottomText}
        </Typography>
      </Card>
    </Box>
  );
}
