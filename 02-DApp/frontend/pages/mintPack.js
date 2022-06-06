import {
  useAccount,
  useConnect,
  useSigner,
  useProvider,
  useContract,
  useEnsLookup,
  useNetwork,
} from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
} from "@mui/material";
import Image from "next/image";
// import CONSTANTS from "../Constants.js";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
import * as utils from "@ethersproject/hash";
import { hexZeroPad } from "@ethersproject/bytes";
import profilePic from "../assets/images/starter-pack.png";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt.js";
import LoadingPrompt from "../components/LoadingPrompt.js";

export default function MintPack({ setDisplay }) {
  // WAGMI Hooks
  const [{ data: connectData, error: connectError }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [activeChain, chains] = useNetwork()
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const [{ data: signerData, error, loading }, getSigner] = useSigner();

  // State Variables
  const [gameItemsContract, setGameItemsContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [packsAvailable, setPacksAvailable] = useState(null);

  const currentUserChain = activeChain?.data?.chain?.id

  const isPolygon = currentUserChain === 137

  const checkUserChain = () => {
    if (!currentUserChain || currentUserChain != 137) {
      if (currentUserChain === 1) {
        // in the future we can potentially switch networks for them using useNetwork wagmi hook?
        alert("Uh oh, you are currently on the Ethereum mainnet. Please switch to Polygon to proceed with the mint.")
      } else {
        alert("Please switch to the Polygon network to proceed with the mint!")
      }
    }
  }

  // Use Effect for component mount
  useEffect(async () => {
    if (accountData) {
      // Initialize connections to GameItems contract
      const GameItemsContract = new ethers.Contract(
        CONTRACT_ADDRESSES.GameItems,
        GameItemsJSON.abi,
        provider
      );
      setGameItemsContract(GameItemsContract);

      // Grab packs available
      const packsAvail = await GameItemsContract.packsAvailable();
      setPacksAvailable(packsAvail.toNumber());

      // Callback for when packMinted Events is fired from contract
      const signerAddress = accountData.address;
      const packMintedCallback = (signer, packID) => {
        if (signer == signerAddress) {
          setIsMinting(false);
          setHasMinted(true);
        }
      };

      // A filter that matches my address as the signer of the contract call
      // NOTE: this filtering has not been implemented, we instead filter on the frontend to match events with sessions
      console.log(hexZeroPad(signerAddress, 32));
      const filter = {
        address: GameItemsContract.address,
        topics: [
          utils.id("packMinted(address,uint256)"),
          // TODO something wrong with this line
          // hexZeroPad(signerAddress, 32)
        ],
      };
      GameItemsContract.on(filter, packMintedCallback);

      checkUserChain()
    } else {
      console.log("no account data found!");
    }
  }, []);

  useEffect(() => {
    console.log("user chain changed: ", currentUserChain)
  }, [currentUserChain])

  const mintStarterPack = async () => {
    if (gameItemsContract) {
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const gameItemsContractWithSigner = gameItemsContract.connect(signerData);

      const mintTxn = await gameItemsContractWithSigner
        .mintStarterPack()
        .then((res) => {
          console.log("txn result: " + JSON.stringify(res, null, 2));
          setIsMinting(true);
          console.log("Minting pack in progress...");
        })
        .catch((error) => {
          alert("error: " + error.message);
        });
    }
  };

  return (
    <Box>
      <Fab
        variant="extended"
        size="small"
        aria-label="add"
        onClick={() => setDisplay(false)}
      >
        &#60; BACK
      </Fab>
      {accountData && !(isMinting || hasMinted) && packsAvailable != 0 && (
        <Container maxWidth="lg" justifyContent="center" alignItems="center">
          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 260,
                height: 350,
              },
            }}
          >
            <Paper
              elevation={0}
              style={{
                background:
                  "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                filter: "blur(35px)",
              }}
            />
            <Container sx={{ position: "absolute" }}>
              <Image
                src={profilePic}
                alt="Picture of the author"
                width="310px"
                height="450px"
                position="absolute"
              />
            </Container>
          </Box>

          <Box
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              display: "flex",
            }}
          >
            <Typography variant="h2" color="white" component="div">
              Mint Starter Pack
            </Typography>
            {packsAvailable != null && (
              <Typography variant="h4" color="white" component="div">
                There are{" "}
                <Box fontWeight="fontWeightBold" display="inline">
                  {packsAvailable}
                </Box>{" "}
                packs still available
              </Typography>
            )}
          </Box>
          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
              paddingTop: "20px",
            }}
          >
            <Button
              onClick={mintStarterPack}
              variant="contained"
              color="inherit"
              style={{
                color: "black",
                borderRadius: "40px",
                width: "10%",
                fontSize: 20,
              }}
              disabled={!isPolygon}
            >
              MINT
            </Button>
          </Box>
          <Box
            justifyContent="center"
            alignItems="center"
            sx={{
              display: "flex",
              paddingTop: "20px",
            }}
          >
            {!isPolygon &&
              <Typography
                style={{
                  color: "red",
                  fontSize: 16
                }}
              >
                Please switch to Polygon to proceed with minting.
              </Typography>
            }
          </Box>
        </Container>
      )}
      {isMinting && (
        <LoadingPrompt completeTitle={"Minting Your Pack!"} />
      )}
      {hasMinted && (
        <Box>
          <Typography>
            Your Team Diff Starter Pack is all done minting!
          </Typography>
          <a
            href={
              "https://testnets.opensea.io/assets/" +
              gameItemsContract.address +
              "/50" // the pack Id is after the athletes (not 0)
            }
            target={"_blank"}
            rel="noreferrer"
          >
            View on OpenSea.
          </a>

          <a
            href={
              "https://twitter.com/intent/tweet?text=Just%20minted%20a%20@teamdiffxyz%20starter%20pack.%20Come%20build%20your%20dream%20roster%20and%20compete%20with%20me%20for%20USDC%20tokens!%20https://opensea.io/assets/matic/" +
              gameItemsContract.address +
              "/50" // the pack Id is after the athletes (not 0)
            }
            target={"_blank"}
            rel="noreferrer"
          >
            Tweet
          </a>
          <Typography>
            Note that it may take a few minutes for images and metadata to
            properly load on OpenSea.
          </Typography>
        </Box>
      )}
      {!accountData && !hasMinted && !isMinting && (
        <ConnectWalletPrompt accessing={"minting a pack"} />
      )}
      {packsAvailable == 0 && (
        <Box>
          <Typography>Sorry, all packs have already been minted :(</Typography>
        </Box>
      )}
    </Box>
  );
}
