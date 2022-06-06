import { Typography, Box, Card } from "@mui/material";
import PacmanLoader from "react-spinners/PacmanLoader"

export default function LoadingPrompt({ loading, bottomText }) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Card sx={{ textAlign: "center", padding: 3, color: "white", width: "30rem" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    Loading {loading}
                </Typography>
                <Box sx={{ padding: 3, paddingBottom: 8, marginTop: 0, marginRight: 10 }}>
                    <PacmanLoader color={"#aa10ad"} size={30} margin={2} />
                </Box>
                <Typography variant="h6" sx={{ fontSize: "1.1rem", marginTop: "1rem", marginBottom: ".4rem" }}>
                    {bottomText}
                </Typography>

            </Card>
        </Box>
    );
}