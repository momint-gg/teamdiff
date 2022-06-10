import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Grid, Link, Typography } from "@mui/material";
import { ethers } from "ethers";
import { React, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import AthleteCard from "../components/AthleteCard";
import AthleteCardModal from "../components/AthleteCardModal";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import MetaMaskRedirectInstructions from "../components/MetaMaskRedirectInstructions";
import constants from "../constants";

export default function Collection() {
  // State Hooks
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoMetaMask, setIsNoMetaMask] = useState();

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  /**
   * Handles a change in injected etheruem provider from MetaMask
   */
  function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      console.log("Ethereum successfully detected!");
      // Access the decentralized web!
    } else {
      setIsNoMetaMask(true);
      setIsLoading(false);

      // alert("Close this alert to redirect to MetaMask Mobile Browser");
      window.open("https://metamask.app.link/dapp/teamdiff.xyz/");
      console.log("Please install MetaMask!");
    }
  }

  /**
   * Checks if browsers has injected web3 provider
   * and if so, gets connected account data, or sets to null if no connected account
   */
  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const setAccountData = async () => {
        const signer = provider.getSigner();
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const accountAddress = await signer.getAddress();
          setConnectedAccount(accountAddress);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        setIsLoading(false);
      };
      setAccountData();
      provider.provider.on("accountsChanged", () => {
        setAccountData();
      });
      provider.provider.on("disconnect", () => {
        console.log("disconnected");
        setIsConnected(false);
      });
    } else {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      });

      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000); // 3 seconds
    }
  }, []);

  // const handleModalOpen = () => {
  //   setModalOpen(true);
  // };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  /**
   * Resets the owned Pack and Athlete NFTS state, and refetches that data from connected Account, and sets it to state var
   */
  useEffect(() => {
    setPackNFTs([]);
    setAthleteNFTs([]);
    if (isConnected) {
      // Get the owned GAmeItems ERC-1155s from the connectedAccount
      const getNFTData = async () => {
        const web3 = createAlchemyWeb3(constants.ALCHEMY_LINK);

        const nfts = await web3.alchemy.getNfts({
          owner: connectedAccount,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        });

        setNFTResp(nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: CONTRACT_ADDRESSES.GameItems,
            tokenId: token,
          });
          // console.log(
          //   "Token #" +
          //     token +
          //     " metadata: " +
          //     JSON.stringify(response, null, 2)
          // );

          // Check metadata of ERC-1155, and assing to create State list
          if (response.title?.includes("Pack")) {
            setPackNFTs((packNFTs) => [...packNFTs, response]);
          } else {
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
          }
        }
      };

      getNFTData().catch((error) => {
        console.log("fetch NFT DATA error: " + JSON.stringify(error, null, 2));
      });
    }
  }, [isConnected, connectedAccount]);

  if (isLoading) {
    return <LoadingPrompt loading={"Collection"} />;
  } else if (isNoMetaMask) {
    return <MetaMaskRedirectInstructions />;
  } else if (isConnected && nftResp) {
    return (
      <Box>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          color="secondary"
          component="div"
          style={{ marginTop: 10 }}
        >
          My TeamDiff Athlete Cards
        </Typography>
        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />
        {athleteNFTs.length > 0 ? (
          <Grid container spacing={isMobile ? 1 : 3}>
            {athleteNFTs?.map((athleteData) => (
              <Grid item xs={isMobile ? 12 : 4}>
                <AthleteCard
                  athleteData={athleteData}
                  setAthlete={setCurrAthlete}
                  setModalOpen={setModalOpen}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Typography>
              {"It's pretty lonely here. "}
              <Link>
                <a
                  className="primary-link"
                  target="_blank"
                  href={"mintPack"}
                  rel="noreferrer"
                >
                  Open
                </a>
              </Link>
              {" a TeamDiff Starter Pack now!"}
            </Typography>
            <br></br>
          </>
        )}
        <AthleteCardModal
          modalOpen={modalOpen}
          athleteData={currAthlete}
          handleModalClose={handleModalClose}
        />
        <Typography
          variant={isMobile ? "h4" : "h3"}
          color="secondary"
          component="div"
          sx={{ marginTop: 3 }}
        >
          My TeamDiff Starter Packs
        </Typography>
        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />
        {packNFTs.length > 0 ? (
          <Grid container spacing={isMobile ? 1 : 3}>
            {packNFTs?.map((athleteData) => (
              <Grid item xs={isMobile ? 12 : 4}>
                <AthleteCard
                  athleteData={athleteData}
                  setAthlete={setCurrAthlete}
                  setModalOpen={setModalOpen}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Typography>
              {"It's pretty lonely here. "}
              <Link>
                <a
                  className="primary-link"
                  target="_blank"
                  href={"mintPack"}
                  rel="noreferrer"
                >
                  Mint
                </a>
              </Link>
              {" a TeamDiff Starter Pack now!"}
            </Typography>
            <br></br>
          </>
        )}
      </Box>
    );
  } else if (isConnected) {
    return <LoadingPrompt loading={"Your Collection"} />;
  }

  return <ConnectWalletPrompt accessing={"your collection"} />;
}
