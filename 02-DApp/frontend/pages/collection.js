import { useState, useEffect } from "react";
import { ethers } from "ethers";

import AthleteCard from "../components/AthleteCard";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Grid } from "@mui/material";
import constants from "../Constants";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";

import ConnectWallet from "./connectWallet";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import AthleteCardModal from "../components/AthleteCardModal";
import { useMediaQuery } from 'react-responsive';

export default function Collection() {
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    // const fetchData = async () => {
    //   const currentAddress = await signer.getAddress()
    //   setAddressPreview(currentAddress)
    // }
    // fetchData()
    const setAccountData = async () => {
      const signer = provider.getSigner()
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const accountAddress = await signer.getAddress()
        setSigner(signer)
        setConnectedAccount(accountAddress)
        setIsConnected(true)

      }
      else {
        setIsConnected(false);
      }
    }
    setAccountData()
    provider.provider.on('accountsChanged', (accounts) => { setAccountData() })
    provider.provider.on('disconnect', () => {
      console.log("disconnected");
      setIsConnected(false)
    })
  }, []);

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

  const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

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
          console.log("Token #" + token + " metadata: " + JSON.stringify(response, null, 2));
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
          variant={isMobile ? "h4" : "h2"}
          color="secondary"
          component="div">
          PACKS
        </Typography>
        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />
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
        <Typography
          variant={isMobile ? "h4" : "h2"}
          color="secondary"
          component="div"
          style={{ marginTop: 10 }}
        >
          PLAYERS
        </Typography>
        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />
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
        <AthleteCardModal
          modalOpen={modalOpen}
          athleteData={currAthlete}
          handleModalClose={handleModalClose}
        />
      </Box>
    );
  } else if (isConnected) {
    return (
      <LoadingPrompt loading={"Your Collection"} />
    );
  }

  return (
    <ConnectWalletPrompt accessing={"your collection"} />
  );
}
