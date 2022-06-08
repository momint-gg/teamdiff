<<<<<<< HEAD
<<<<<<< HEAD
import { useAccount, useConnect, useEnsName, useEnsAvatar } from "wagmi";
import { useEffect, useState } from "react";

=======
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
import { Box, Button, Modal, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useConnect } from "wagmi";
import CoinbaseWallet from "../assets/images/coinbase.png";
import MetaMask from "../assets/images/metamask.png";
import WalletConnect from "../assets/images/wallet-connect.png";

export default function ConnectWalletModal({
  modalOpen,
  handleClickAway,
  setModalOpen,
  isMobile,
}) {
<<<<<<< HEAD
<<<<<<< HEAD
  const {
    activeConnector,
    connect,
    connectors,
    error: connectError,
    isConnecting,
    pendingConnector,
  } = useConnect();
=======
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
  const { connect, connectors, error: connectError } = useConnect();

  // const [signer, setSigner] = useState(null);
  // const [connectedAccount, setConnectedAccount] = useState(null);
  // const [isConnected, setIsConnected] = useState(false);
<<<<<<< HEAD
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

  // useEffect(() => {
  //   // setIsCreatingLeague(false);
  //   // setHasCreatedLeague(true);
  //   // setHasJoinedLeague(true)
  //   // setIsConnected(false)

  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner()

<<<<<<< HEAD
<<<<<<< HEAD
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // const fetchData = async () => {
    //   const currentAddress = await signer.getAddress()
    //   setAddressPreview(currentAddress)
    // }
    // fetchData()
    const setAccountData = async () => {
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const accountAddress = await signer.getAddress();
        setSigner(signer);
        setConnectedAccount(accountAddress);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };
    setAccountData();
    provider.provider.on("accountsChanged", (accounts) => {
      setAccountData();
    });
    provider.provider.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });
  }, []);
=======
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
  //     // const fetchData = async () => {
  //     //   const currentAddress = await signer.getAddress()
  //     //   setAddressPreview(currentAddress)
  //     // }
  //     // fetchData()
  //     const setAccountData = async () => {
  //       const signer = provider.getSigner()
  //       const accounts = await provider.listAccounts();

  //       if(accounts.length > 0) {
  //         const accountAddress = await signer.getAddress()
  //         setSigner(signer)
  //         setConnectedAccount(accountAddress)
  //         // setIsConnected(true)

  //       }
  //       else {
  //         setIsConnected(false);
  //       }
  //     }
  //     setAccountData()
  //     provider.provider.on('accountsChanged', (accounts) => { setAccountData() })
  //     provider.provider.on('disconnect', () =>  { console.log("disconnected");
  //                                                 setIsConnected(false) })
  //   }, []);
<<<<<<< HEAD
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

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

  // var shortenedAddress = "";
  // if (accountData?.address) {
  //   shortenedAddress = `${accountData.address.slice(
  //     0,
  //     6
  //   )}...${accountData.address.slice(
  //     accountData.address.length - 4,
  //     accountData.address.length
  //   )}`;
  // }

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
              handleModalClose();
              if (handleClickAway) {
                handleClickAway();
              }
            }}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: "5px",
              top: "5px",
            }}
          />
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
              handleModalClose();
              if (handleClickAway) {
                handleClickAway();
              }
            }}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: "10px",
              top: "10px",
            }}
          />
          {connectors.map((x) => (
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
