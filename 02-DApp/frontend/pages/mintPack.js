import {
  useAccount,
  useConnect,
  useSigner,
  useProvider,
  useContract,
  useEnsLookup,
  useDisconnect
} from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  CircularProgress,
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

export default function MintPack({ setDisplay }) {
  // WAGMI Hooks
  // const { data: accountData, isLoading, error } = useAccount({ ens: true })

  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  
  // State Variables
  const [gameItemsContract, setGameItemsContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [packsAvailable, setPacksAvailable] = useState(null);
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

        if(accounts.length > 0) {
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
      provider.provider.on('disconnect', () =>  { console.log("disconnected"); 
                                                  setIsConnected(false) })
    }, []);


  // Use Effect for component mount
  useEffect(async () => {
    if (isConnected) {
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
      // const signerAddress = accountData.address;
      const packMintedCallback = (signer, packID) => {
        if (signer == connectedAccount) {
          setIsMinting(false);
          setHasMinted(true);
        }
      };

      // A filter that matches my address as the signer of the contract call
      // NOTE: this filtering has not been implemented, we instead filter on the frontend to match events with sessions
      console.log(hexZeroPad(connectedAccount, 32));
      const filter = {
        address: GameItemsContract.address,
        topics: [
          utils.id("packMinted(address,uint256)"),
          // TODO something wrong with this line
          // hexZeroPad(signerAddress, 32)
        ],
      };
      GameItemsContract.on(filter, packMintedCallback);
    }
    else {
      console.log("no account connected");
    }
  }, [isConnected]);


  const mintStarterPack = async () => {
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner()
      const gameItemsContractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESSES.GameItems,
        GameItemsJSON.abi,
        signer
      );

      const mintTxn = await gameItemsContractWithSigner
        .mintStarterPack()
        .then((res) => {
          console.log("txn result: " + JSON.stringify(res, null, 2));
          setIsMinting(true);
          console.log("Minting pack in progress...");
        })
        .catch((error) => {
          alert("error: " + error.error.message);
        });
  };

  return (
    <Box>
      {/* <Fab
        variant="extended"
        size="small"
        aria-label="add"
        onClick={() => setDisplay(false)}
      >
        &#60; BACK
      </Fab> */}
      {isConnected && !(isMinting || hasMinted) && packsAvailable != 0 && (
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
            >
              MINT
            </Button>
          </Box>
        </Container>
      )}
      {isMinting && (
        <Container>
          <Typography>Your stuff is minting...</Typography>
          <CircularProgress />
        </Container>
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
          <Typography>
            Note that it may take a few minutes for images and metadata to
            properly load on OpenSea.
          </Typography>
        </Box>
      )}
      {!isConnected && !hasMinted && !isMinting && (
        <Box>
          <Typography variant="h6" component="div">
            Please connect your wallet to get started.
          </Typography>
        </Box>  
      )}
      {packsAvailable == 0 && (
        <Box>
          <Typography>Sorry, all packs have already been minted :(</Typography>
        </Box>
      )}
    </Box>
  );
}
