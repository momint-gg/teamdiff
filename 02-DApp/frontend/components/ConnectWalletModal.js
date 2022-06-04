import { useAccount, useConnect } from "wagmi";
import { Box, Button, Modal, Typography } from "@mui/material";
import Image from "next/image";
import MetaMask from "../assets/images/metamask.png";
import WalletConnect from "../assets/images/wallet-connect.png";
import CoinbaseWallet from "../assets/images/coinbase.png";
import { IoCloseOutline } from "react-icons/io5";

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
  // const [{ data: connectData, error: connectError }, connect] = useConnect();
  // const [{ data: accountData }, disconnect] = useAccount({
  //   fetchEns: true,
  // });

  function getConnectorImage(connector) {
    if (connector.name === "MetaMask") {
      return MetaMask;
    } else if (connector.name === "WalletConnect") {
      return WalletConnect;
    } else if (connector.name === "Coinbase Wallet") {
      return CoinbaseWallet;
    } else {
      return MetaMask;
    }
  }

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
      {isMobile ? (
        <Box
          sx={{
            position: "absolute",
            borderTop: "50%",
            borderLeft: "25%",
            width: "23rem",
            height: "25rem",
            backgroundColor: "white",
            boxShadow: 24,
            borderRadius: "10%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: 6,
          }}
        >
          <Typography color={"#1A1A1A"} fontSize={30} fontWeight={"bold"}>
            Connect Wallet
          </Typography>
          <IoCloseOutline 
          size={"3rem"} 
          onClick={() => {
            handleModalClose()
            if (handleClickAway) {
              handleClickAway()
            }}} 
          style={{ cursor: "pointer",
                   position: "absolute",
                   right: "5px",
                   top: "5px"
                }}
          />
          {connectData.connectors.map((x) => (
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
              sx={{
                flexBasis: "100%",
                marginBottom: 2,
                borderRadius: "20px",
                backgroundColor: "#F4F4F4",
                borderColor: "#dddddd",
                color: "black",
                fontWeight: "500",
                textTransform: "capitalize",
                fontSize: "1.4em",
                textAlign: "left",
                ":hover": {
                  backgroundColor: "#dddddd!important",
                },
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Image
                  src={getConnectorImage(x)}
                  alt={x.name}
                  width="35rem"
                  height="35rem"
                />
                {x.name}
                {!x.ready && " (unsupported)"}
              </div>
            </Button>
          ))}
          {connectError && (
            <div>{connectError?.message ?? "Failed to connect"}</div>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            position: "absolute",
            borderTop: "50%",
            borderLeft: "50%",
            width: "30rem",
            height: "30rem",
            backgroundColor: "white",
            boxShadow: 24,
            borderRadius: "10%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: 8,
          }}
        >
          <Typography color={"#1A1A1A"} fontSize={30} fontWeight={"bolder"}>
            Connect Wallet
          </Typography>
          <IoCloseOutline 
          size={"3rem"} 
          onClick={() => {
            handleModalClose()
            if (handleClickAway) {
              handleClickAway()
            }}} 
          style={{ cursor: "pointer",
                   position: "absolute",
                   right: "10px",
                   top: "10px"
                }}
          />
          {connectData.connectors.map((x) => (
            <Button
              variant="contained"
              disabled={!x.ready}
              key={x.id}
              onClick={() => {
                connect(x);
                handleModalClose();
                if (handleClickAway) {
                  handleClickAway();
                }
              }}
              sx={{
                flexBasis: "100%",
                marginBottom: 2,
                borderRadius: "20px",
                backgroundColor: "#F4F4F4",
                borderColor: "#dddddd",
                color: "black",
                fontWeight: "500",
                textTransform: "capitalize",
                fontSize: "1.4em",
                textAlign: "left",
                ":hover": {
                  backgroundColor: "#dddddd!important",
                },
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Image
                  src={getConnectorImage(x)}
                  alt={x.name}
                  width="35rem"
                  height="35rem"
                />
                {x.name}
                {!x.ready && " (unsupported)"}
              </div>
            </Button>
          ))}
          {connectError && (
            <div>{connectError?.message ?? "Failed to connect"}</div>
          )}
        </Box>
      )}
    </Modal>
  );
}
