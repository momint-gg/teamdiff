import { useAccount, 
  useConnect,
 useEnsAvatar, 
 useEnsName,
 useDisconnect } from "wagmi";
import { Box, Button, Modal, Typography, } from '@mui/material'

export default function ConnectWalletModal({
  modalOpen,
  handleClickAway,
  setModalOpen,
  isMobile,
}) {
  // const [{ data: connectData, error: connectError }, connect] = useConnect();
  // const [{ data: accountData }, disconnect] = useAccount({
  //   fetchEns: true,
  // });
  const {
    activeConnector,
    connect,
    connectors,
    error : connectError,
    isConnecting,
    pendingConnector,
  } = useConnect()
  const { data: accountData, isLoading, error } = useAccount({ ens: true })
  const { data: ensName } = useEnsName()
  const { data: ensAvatar } = useEnsAvatar()
  const { disconnect } = useDisconnect()
  const handleModalClose = () => {
    setModalOpen(false);
  };

  var shortenedAddress = "";
  if (accountData?.address) {
    shortenedAddress = `${accountData.address.slice(
      0,
      6
    )}...${accountData.address.slice(
      accountData.address.length - 4,
      accountData.address.length
    )}`;
  }

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
      {isMobile?
      <Box
        sx={{
          position: "absolute",
          borderTop: "50%",
          borderLeft: "25%",
          width: "75%",
          height: "50%",
          backgroundColor: "primary.charcoal",
          boxShadow: 24,
          borderRadius: "10%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 8,
        }}
      >
        <Typography color={"white"} fontSize={30}>CONNECT</Typography>
        {connectors.map((x) => (
          <Button
            variant="outlined"
            color="secondary"
            disabled={!x.ready}
            key={x.id}
            onClick={() => {
              connect(x);
              handleModalClose();
              if (handleClickAway) {
                handleClickAway();
              }
            }}
            sx={{ flexBasis: "100%", marginBottom: 2, borderRadius: "40px" }}
          >
            {x.name}
            {!x.ready && " (unsupported)"}
          </Button>
        ))}
        {connectError && (
          <div>{connectError?.message ?? "Failed to connect"}</div>
        )}
      </Box> :
      <Box
        sx={{
          position: "absolute",
          borderTop: "50%",
          borderLeft: "50%",
          width: "25%",
          height: "50%",
          backgroundColor: "primary.charcoal",
          boxShadow: 24,
          borderRadius: "10%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 8,
        }}
      >
        <Typography color={"white"} fontSize={30}>CONNECT</Typography>
        {connectors.map((x) => (
          <Button
            variant="outlined"
            color="secondary"
            disabled={!x.ready}
            key={x.id}
            onClick={() => {
              connect(x);
              handleModalClose();
              if (handleClickAway) {
                handleClickAway();
              }
            }}
            sx={{ flexBasis: "100%", marginBottom: 2, borderRadius: "40px" }}
          >
            {x.name}
            {!x.ready && " (unsupported)"}
          </Button>
        ))}
        {connectError && (
          <div>{connectError?.message ?? "Failed to connect"}</div>
        )}
      </Box>
      }
    </Modal>
  );
}
