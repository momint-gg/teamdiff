import { useAccount, 
         useConnect,
        useEnsAvatar, 
        useEnsName,
        useDisconnect } from "wagmi";
import { Box, Button, Avatar, Chip, ClickAwayListener } from "@mui/material";
import { useEffect, useState } from "react";
import ConnectWalletModal from "./ConnectWalletModal";

export default function WalletLogin({isMobile}) {
  const { isConnected, connector, connectors, connectAsync } = useConnect()
  // const [{ data: accountData }, disconnect] = useAccount({
  //   fetchEns: true,
  // });
  const { data: accountData, isLoading, error } = useAccount({ ens: true })
  const { data: ensName } = useEnsName()
  const { data: ensAvatar } = useEnsAvatar()
  const { disconnect } = useDisconnect()
  const [ shortenedAddress, setShortenedAddress ] = useState();

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
    if (accountData?.address) {
      var shortenedAddress1 = `${accountData.address.slice(
        0,
        6
      )}...${accountData.address.slice(
        accountData.address.length - 4,
        accountData.address.length
      )}`;
      setShortenedAddress(shortenedAddress1);
    }

  }, [accountData?.address])
  
  return (
    <Box>
      {accountData?.address ? (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: "relative" }}>
            {isMobile?
            <Chip
              avatar={
                <Avatar
                  alt="Avatar"
                  src={
                    useEnsAvatar?.data
                      ? useEnsAvatar.data
                      : "avatar.png"
                  }
                />
              }
              label={
                useEnsName?.data
                  ? `${useEnsName.data}`
                  : shortenedAddress
              }
              variant="outlined"
              clickable={true}
              onClick={handleClick}
              sx={{ height: 30, fontSize: 14 }}
            /> :
            <Chip
              avatar={
                <Avatar
                  alt="Avatar"
                  src={
                    useEnsAvatar?.data
                      ? useEnsAvatar.data
                      : "avatar.png"
                  }
                />
              }
              label={
                useEnsName?.data
                  ? `${useEnsName.data}`
                  : shortenedAddress
              }
              variant="outlined"
              clickable={true}
              onClick={handleClick}
              sx={{ height: 40, fontSize: 18 }}
            />
            }
            {menu ? (
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
                    disconnect();
                    handleModalClose();
                  }}
                  sx={{ flexBasis: "100%", borderRadius: "40px" }}
                >
                  DISCONNECT
                </Button>
              </Box>
            ) : null}
          </Box>
        </ClickAwayListener>
      ) : (
        <div>
          {isMobile? 
            <Button
              variant="contained"
              color="inherit"
              onClick={handleModalOpen}
              style={{ color: "black", borderRadius: "40px", fontSize: 14 }}
            >
              CONNECT
            </Button> :
            <Button
              variant="contained"
              color="inherit"
              onClick={handleModalOpen}
              style={{ color: "black", borderRadius: "40px", fontSize: 15 }}
            >
              CONNECT WALLET
            </Button>
          }
          
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
