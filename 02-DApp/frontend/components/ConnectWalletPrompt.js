import { Typography, Box, Card } from "@mui/material";

export default function ConnectWalletPrompt({ accessing }) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Card sx={{ textAlign: "center", padding: 3, color: "white", width: "30rem" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    Connect
                </Typography>
                <Typography variant="h6" sx={{ fontSize: "1.1rem", marginTop: ".4rem" }}>
                    Whether it's your first time visiting, or you're a returning pro, make sure to connect your wallet to access {accessing ? `the ${accessing}` : "TeamDiff"}.
                </Typography>
            </Card>
        </Box>
    );
}