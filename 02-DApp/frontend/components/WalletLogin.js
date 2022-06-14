import { Avatar, Box, Button, Chip, ClickAwayListener } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  useEnsAvatar,
  useEnsName
} from "wagmi";
import ConnectWalletModal from "./ConnectWalletModal";


export default function WalletLogin({ isMobile }) {
  // const { isConnected, connector, connectors, connectAsync } = useConnect()
  // const [{ data: accountData }, disconnect] = useAccount({
  //   fetchEns: true,
  // });
  // const { data: accountData, isLoading, error } = useAccount({ ens: true })
  // const { data: ensName } = useEnsName()
  // const { data: ensAvatar } = useEnsAvatar()
  // const { disconnect } = useDisconnect()
  const [isConnected, setIsConnected] = useState();
  const [shortenedAddress, setShortenedAddress] = useState();
  // const [isConnected, setIsConnected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleClick = () => {
    setMenu((menu) => !menu);
  };
  const handleClickAway = () => {
    setMenu(false);
  };

  // var shortenedAddress = "";
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // console.log("signer: " + signer.getAddress());
    // if(accounts.length > 0) {
    const fetchData = async () => {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        // const currentAddress = "0x0x"
        const currentAddress = await signer.getAddress();
        setAddressPreview(currentAddress);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        // console.log("no connected accounts");
      }
    };
    fetchData();
    provider.provider.on("accountsChanged", (accounts) => {
      fetchData();
    });
    provider.provider.on("disconnect", () => {
      // console.log("disconnected");
      setIsConnected(false);
    });
  }, []);

  const setAddressPreview = (address) => {
    // console.log("address: " + address);
    const shortenedAddress1 = `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
    setShortenedAddress(shortenedAddress1);
    // setIsConnected(true);
  };

  return (
    <Box>
      {isConnected ? (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: "relative" }}>
            {isMobile ? (
              <Chip
                avatar={
                  <Avatar
                    alt="Avatar"
                    src={useEnsAvatar?.data ? useEnsAvatar.data : "avatar.png"}
                  />
                }
                label={
                  useEnsName?.data ? `${useEnsName.data}` : shortenedAddress
                }
                variant="outlined"
                clickable={true}
                onClick={handleClick}
                sx={{ height: 30, fontSize: 14 }}
              />
            ) : (
              <Chip
                avatar={
                  <Avatar
                    alt="Avatar"
                    src={useEnsAvatar?.data ? useEnsAvatar.data : "avatar.png"}
                  />
                }
                label={
                  useEnsName?.data ? `${useEnsName.data}` : shortenedAddress
                }
                variant="outlined"
                clickable={true}
                onClick={handleClick}
                sx={{ height: 40, fontSize: 18 }}
              />
            )}
            {/* {menu ? (
              <Box
                sx={{
                  position: "absolute",
                  backgroundColor: "primary.charcoal",
                  borderRadius: 2,
                  padding: 1,
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setMenu(false);
                    setIsConnected(false);
                  }}
                  sx={{ flexBasis: "100%", borderRadius: "40px" }}
                >
                  DISCONNECT
                </Button>
              </Box>
            ) : null} */}
          </Box>
        </ClickAwayListener>
      ) : (
        <div>
          {isMobile ? (
            <Button
              variant="contained"
              color="inherit"
              onClick={handleModalOpen}
              style={{ color: "black", borderRadius: "40px", fontSize: 14 }}
            >
              CONNECT
            </Button>
          ) : (
            <Button
              variant="contained"
              color="inherit"
              onClick={handleModalOpen}
              style={{ color: "black", borderRadius: "40px", fontSize: 15 }}
            >
              CONNECT
            </Button>
          )}

          {modalOpen && (
            <ConnectWalletModal
              modalOpen={modalOpen}
              handleClickAway={handleClickAway}
              setModalOpen={setModalOpen}
              isMobile={isMobile}
            />
          )}
        </div>
      )}
    </Box>
  );
}
