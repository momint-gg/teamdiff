import { useAccount, useDisconnect, useConnect } from "wagmi";
import "bootstrap/dist/css/bootstrap.css";
import { Box, Button } from "@mui/material";

export default function ConnectWallet() {
  const [{ data: connectData, error: connectError }, connect] = useConnect();
  const { data: accountData, isLoading, error } = useAccount({ ens: true });
  const { disconnect } = useDisconnect();

  if (accountData) {
    return (
      <Box>
        <img src={accountData.ens?.avatar} alt="ENS Avatar" />
        <div>
          {accountData.ens?.name
            ? `${accountData.ens?.name} (${accountData.address})`
            : accountData.address}
        </div>
        <div>Connected to {accountData.connector.name}</div>
        <Button variant="outlined" color="secondary" onClick={disconnect}>
          Disconnecsdft
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {connectData.connectors.map((x) => (
        <Button
          variant="outlined"
          color="secondary"
          disabled={!x.ready}
          key={x.id}
          onClick={() => connect(x)}
        >
          {x.name}
          {!x.ready && " (unsupported)"}
        </Button>
      ))}
      {connectError && (
        <div>{connectError?.message ?? "Failed to connect"}</div>
      )}
    </Box>
  );
}
