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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    // setHasMinted(true);
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
      {isConnected && !hasMinted &&
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
                // width="310px"
                // height="100vw"
                // height="450px"
                position="absolute"
              />
            </Container>
        </Box>
      }
      {isConnected && !(isMinting || hasMinted) && packsAvailable != 0 && (
        <Container maxWidth="lg" justifyContent="center" alignItems="center">
          <Box
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              display: "flex",
            }}
          >
            <Typography variant="h3" color="white" component="div">
              Mint Starter Pack
            </Typography>
            {packsAvailable != null && (
              <Typography variant="h6" color="white" component="div">
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
            <Fab
              variant="extended"
              size="large"
              aria-label="add"
              onClick={mintStarterPack}
              // onClick={() => setDisplayMint(true)}
              sx={{
                marginRight: 1,
                background:
                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                color: "white",
                fontSize: 20,
              }}
            >
              Mint
            </Fab>
          </Box>
        </Container>
      )}
      {isMinting && (
        <Container maxWidth="lg" justifyContent="center" alignItems="center">
          <Box
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              display: "flex",
            }}
          >
            <Typography variant="h5" color="white" component="div">
              Minting In Progress
            </Typography>
            <br></br>
            <CircularProgress />
          </Box>
        </Container>
      )}
      {hasMinted && (
        <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly"
          }}
        >
          <Box
            sx={{
              flex: 3
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
            <Typography sx={{marginRight: 2}} variant="h4" color="white" component="div">
              Acquired Starter Pack!
            </Typography>
            <CheckCircleIcon color="secondary"></CheckCircleIcon>
            </Box>
            <br></br>
            <Box>
              <Box
                sx={{
                 display: "flex",
                 flexDirection: "row",
                 justifyContent: "space-between"
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    marginRight: 3
                  }}
                >
                  <Typography variant="h5"> Contents </Typography>
                  <a
                    href={
                      "https://testnets.opensea.io/assets/" +
                      gameItemsContract.address +
                      "/50" // the pack Id is after the athletes (not 0)
                    }
                    // href="#"
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    View on OpenSea.
                  </a> 
                  <Typography variant="subtitle2"> 
                    Note that it may take a few minutes for images and metadata to
                    properly load on OpenSea.
                  </Typography>               
                </Box>
                
                <Box
                  sx={{
                    flex: 1
                  }}
                >
                  <Typography variant="h5"> Pack #</Typography>
                  <Typography> {100 - packsAvailable} </Typography>
                    
                </Box>
              </Box>
            </Box>
        

            <Box>
              <Fab
                variant="extended"
                size="large"
                aria-label="add"
                onClick={() => router.push("./burnPack")}
                // onClick={() => setDisplayMint(true)}
                sx={{
                  marginTop: 5,
                  marginRight: 1,
                  background:
                    "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                  color: "white",
                  fontSize: 20,
                }}
              >
                Open Pack
              </Fab>
              <Fab
                variant="extended"
                size="large"
                color="white"
                aria-label="add"
                // onClick={() => setDisplayCollection(true)}
                sx={{ marginTop: 5, fontSize: 20 }}
              >
                Go To Collection
              </Fab>
            </Box>
          </Box>
          <Box sx={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Image
              src={profilePic}
              alt="Picture of the author"
              // height="100%"
              // width="auto"
              width="155px"
              height="225px"
            />
          </Box>
        </Box>
        
      </Container>
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
