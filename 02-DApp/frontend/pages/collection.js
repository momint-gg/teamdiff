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
import constants from "../constants";

export default function Collection() {
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  // const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      console.log("Ethereum successfully detected!");
      // Access the decentralized web!
    } else {
      alert("Please install MetaMask to use this Dapp!");
      console.log("Please install MetaMask!");
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();

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

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  useEffect(() => {
    setPackNFTs([]);
    setAthleteNFTs([]);
    // declare the async data fetching function
    if (isConnected) {
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
          console.log(
            "Token #" +
              token +
              " metadata: " +
              JSON.stringify(response, null, 2)
          );
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

  if (isConnected && nftResp) {
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
