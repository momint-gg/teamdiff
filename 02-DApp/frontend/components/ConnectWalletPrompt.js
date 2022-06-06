import { Typography, Box, Card } from "@mui/material";
import WalletLogin from "./WalletLogin";
import { useMediaQuery } from 'react-responsive';

export default function ConnectWalletPrompt({ accessing }) {
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

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
                <Typography variant="h6" sx={{ fontSize: "1.1rem", marginTop: ".4rem", marginBottom: ".4rem", overflowWrap: "break-word" }}>
                    Whether it's your first time visiting, or you're a returning pro, make sure to connect your wallet to access {accessing ? accessing : "TeamDiff"}.
                </Typography>
                <WalletLogin isMobile={isMobile} />
            </Card>
        </Box>
    );
}