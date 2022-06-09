import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import {
  Box,
  Typography,
  Container,
  Paper,
  Fab,
  Link,
} from "@mui/material";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenSea from "../assets/images/opensea.png"
import LoadingPrompt from "../components/LoadingPrompt";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import { useMediaQuery } from "react-responsive";

import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
import * as utils from "@ethersproject/hash";
import { hexZeroPad } from "@ethersproject/bytes";
import profilePic from "../assets/images/starter-pack.png";
//Router
import { useRouter } from "next/router";

export default function MintPack() {
  // Router
  const router = useRouter();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  console.log(isMobile);

  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );

  // State Variables
  const [gameItemsContract, setGameItemsContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [hasMinted, setHasMinted] = useState(false);
  const [packsAvailable, setPacksAvailable] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChain, setCurrentChain] = useState();
  const [isPolygon, setIsPolygon] = useState();

  useEffect(() => {
    // setHasMinted(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()

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
        const { chainId } = await provider.getNetwork();
        setCurrentChain(chainId);
        setIsPolygon(chainId === 137);
        setIsConnected(true);
        setIsLoading(false);
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
    provider.on("network", async (newNetwork, oldNetwork) => {
      console.log("on");
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        console.log("changed network");
        // window.location.reload();
        // const { chainId } = await provider.getNetwork()
        // setCurrentChain(chainId)
        // setIsPolygon(chainId === 137)
      }
    });
  }, [connectedAccount]);

  const checkUserChain = () => {
    if (!currentChain || currentChain != 137) {
      if (currentChain === 1) {
        // in the future we can potentially switch networks for them using useNetwork wagmi hook?
        alert(
          "Uh oh, you are currently on the Ethereum mainnet. Please switch to Polygon to proceed with the mint."
        );
      }
      // } else {
      //   alert("Please switch to the Polygon network to proceed with the mint!")
      // }
    }
  };

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
      const packMintedCallback = (signerAddress, packID) => {
        console.log("signer in callback : " + signerAddress);
        if (signerAddress == connectedAccount) {
          setIsMinting(false);
          setIsTransactionDelayed(false);
          setHasMinted(true);
        }
      };

      // A filter that matches my address as the signer of the contract call
      // NOTE: this filtering has not been implemented, we instead filter on the frontend to match events with sessions
      // console.log(hexZeroPad(connectedAccount, 32));
      const filter = {
        address: GameItemsContract.address,
        topics: [
          utils.id("packMinted(address,uint256)"),
          // TODO something wrong with this line
          // hexZeroPad(signerAddress, 32)
        ],
      };
      // GameItemsContract.on(filter, packMintedCallback);
      GameItemsContract.once("packMinted", packMintedCallback);
      checkUserChain();
    } else {
      console.log("no account connected");
    }
  }, [isConnected]);

  // useEffect(() => {
  //   console.log("user chain changed: ", currentChain)
  //   // var newChainId;
  //   const fetchData = async () => {
  //     const { chainId } = await provider.getNetwork()
  //     setCurrentChain(chainId)
  //     setIsPolygon(chainId === 137)
  //   }
  //   fetchData();
  // }, [currentChain])

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
        // console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsMinting(true);
        window.setTimeout(() => {
          setIsTransactionDelayed(true);
        }, 60 * 5 * 1000);

        // console.log("Minting pack in progress...");
      })
      .catch((error) => {
        alert("error: " + error.message);
      });
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingPrompt loading={"Mint Page"} />
      ) : (
        <>
          {isConnected && !hasMinted && (
            <Box
              justifyContent="center"
              alignItems="center"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                marginBottom: 4,
                marginTop: 4,
                "& > :not(style)": {
                  m: 1,
                  width: 260,
                  height: 320,
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
                  position="absolute"
                />
              </Container>
            </Box>
          )}
          {isConnected && !(isMinting || hasMinted) && packsAvailable != 0 && (
            <Container
              maxWidth="lg"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                sx={{
                  display: "flex",
                  textAlign: "center",
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
                    paddingRight: 8,
                    paddingLeft: 8
                  }}
                // disabled={!isPolygon}
                >
                  Mint
                </Fab>
              </Box>
              <Box
                justifyContent="center"
                alignItems="center"
                sx={{
                  display: "flex",
                  paddingTop: "20px",
                }}
              >
                {!isPolygon && (
                  <Typography
                    style={{
                      color: "red",
                      fontSize: 16,
                    }}
                  >
                    Please switch to Polygon, then refresh the page, to proceed
                    with minting.
                  </Typography>
                )}
              </Box>
            </Container>
          )}
          {isMinting && (
            <Box sx={{ marginTop: 5 }}>
              <LoadingPrompt
                completeTitle={"Minting Pack in Progress"}
                bottomText={
                  isMinting && isTransactionDelayed
                    ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
                    : ""
                }
              />
            </Box>
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
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <Box
                  sx={{
                    flex: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: "2rem"
                    }}
                  >
                    <Typography
                      sx={{ marginRight: 2, textAlign: "center" }}
                      variant="h4"
                      color="white"
                      component="div"
                    >
                      Acquired Starter Pack!
                    </Typography>
                    {!isMobile && <CheckCircleIcon fontSize="large" sx={{ color: "#13db13" }} />}
                  </Box>
                  {isMobile && <Box
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginBottom: 4,
                      "& > :not(style)": {
                        m: 1,
                        width: 260,
                        height: 330,
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
                        alt="TeamDiff Pack"
                        position="absolute"
                      />
                    </Container>
                  </Box>
                  }
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          marginRight: 3,
                          textAlign: "center",
                          marginBottom: isMobile ? "1rem" : "0"
                        }}
                      >
                        <Typography color="primary" variant="h5"> Pack #</Typography>
                        <Typography variant="h5" color="secondary" sx={{ fontWeight: "bold" }}> {100 - packsAvailable} </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 3,
                          textAlign: "center"
                        }}
                      >
                        <Link
                          href={
                            "https://testnets.opensea.io/assets/" +
                            gameItemsContract.address +
                            "/50" // the pack Id is after the athletes (not 0)
                          }
                          sx={{ textDecoration: "none" }}
                          target={"_blank"}
                        >
                          <Fab
                            variant="extended"
                            size="large"
                            aria-label="add"
                            color={"info"}
                            sx={{ fontSize: 20, color: "white" }}
                          >
                            <Image
                              src={OpenSea}
                              alt={"opensea"}
                              width="30rem"
                              height="30rem"
                            />
                            <Box sx={{ marginLeft: 1 }}>
                              View on OpenSea
                            </Box>
                          </Fab>
                        </Link>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Fab
                      variant="extended"
                      size="large"
                      aria-label="add"
                      onClick={() => router.push("./burnPack")}
                      sx={{
                        marginTop: isMobile ? 3 : 5,
                        marginRight: isMobile ? 0 : 2,
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
                      onClick={() => router.push("./collection")}
                      sx={{ marginTop: isMobile ? 3 : 5, fontSize: 20 }}
                    >
                      Go To My Collection
                    </Fab>
                  </Box>
                </Box>
                {!isMobile && <Box
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    marginLeft: 5,
                    marginTop: 2,
                    "& > :not(style)": {
                      m: 1,
                      width: 260,
                      height: 320,
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
                      alt="TeamDiff Pack"
                      position="absolute"
                    />
                  </Container>
                </Box>
                }
              </Box>
            </Container>
          )}
          {!isConnected && !hasMinted && !isMinting && (
            <ConnectWalletPrompt accessing={"minting a pack"} />
          )}
          {packsAvailable == 0 && (
            <Box>
              <Typography color="primary">
                Sorry, all packs have already been minted :(
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
