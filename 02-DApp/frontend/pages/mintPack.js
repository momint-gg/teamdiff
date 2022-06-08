import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Container, Fab, Link, Paper, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import { ethers } from "ethers";
import Image from "next/image";
// Router
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
// import CONSTANTS from "../Constants.js";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import profilePic from "../assets/images/starter-pack.png";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import MetaMaskRedirectInstructions from "../components/MetaMaskRedirectInstructions";

export default function MintPack() {
  // Router
  const router = useRouter();

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
  const [hasAlreadyMintedPack, setHasAlreadyMintedPack] = useState();
  const [isOnWhitelist, setIsOnWhitelist] = useState();
  const [isPresalePhase, setIsPresalePhase] = useState();
  const [isPublicSalePhase, setIsPublicSalePhase] = useState();
  const [isNoMetaMask, setIsNoMetaMask] = useState();
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

  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
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
        } else {
          setIsConnected(false);
        }
        setIsLoading(false);
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
    } else {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      });

      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000); // 3 seconds
    }
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

      // Grab if user has already minted starter pack
      const hasAlreadyMintedPack1 = await GameItemsContract.userToHasMintedPack(
        connectedAccount
      );
      setHasAlreadyMintedPack(hasAlreadyMintedPack1);

      // Grab if user is on whitelist
      const isOnWhitelist1 = await GameItemsContract.whitelist(
        connectedAccount
      );
      setIsOnWhitelist(isOnWhitelist1);

      // Set if is past presale date
      // open sale start date in UTC
      const presaleEndDate = new Date("June 10, 2022 21:00:00");
      const presaleStartDate = new Date("June 10, 2022 00:00:00");
      // const presaleEndDate = new Date("June 7, 2022 21:00:00");
      // const presaleStartDate = new Date("June 7, 2022 00:00:00");
      const today = new Date();
      const isPresale =
        today.getTime() < presaleEndDate.getTime() &&
        today.getTime() > presaleStartDate.getTime();
      const isPublicSale = today.getTime() > presaleEndDate.getTime();
      // console.log("ispublic: " + isPublicSale);
      setIsPresalePhase(isPresale);
      setIsPublicSalePhase(isPublicSale);

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
      // const filter = {
      //   address: GameItemsContract.address,
      //   topics: [
      //     utils.id("packMinted(address,uint256)"),
      //     // TODO something wrong with this line
      //     // hexZeroPad(signerAddress, 32)
      //   ],
      // };
      // GameItemsContract.on(filter, packMintedCallback);
      GameItemsContract.once("packMinted", packMintedCallback);
      checkUserChain();
    } else {
      console.log("no account connected");
    }
  }, [isConnected, connectedAccount]);

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

    await gameItemsContractWithSigner
      .mintStarterPack()
      .then((res) => {
        // console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsMinting(true);
        window.setTimeout(() => {
          setIsTransactionDelayed(true);
        }, 20 * 1000);

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
          {isNoMetaMask && <MetaMaskRedirectInstructions />}
          {isConnected && !hasMinted && (
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
                }}
              >
                <Typography
                  variant="h3"
                  color="white"
                  textAlign="center"
                  component="div"
                >
                  Mint TeamDiff Starter Pack
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
                  // disabled={!isPolygon}
                  disabled={
                    hasAlreadyMintedPack ||
                    (!isOnWhitelist && isPresalePhase) ||
                    !(isPresalePhase || isPublicSalePhase)
                  }
                >
                  Mint
                </Fab>
              </Box>
              <br></br>
              {isPresalePhase && (
                <Typography
                  textAlign="center"
                  variant="subtitle1"
                  color="secondary"
                >
                  Presale ends June 10th, 5:00 pm EST
                </Typography>
              )}
              {!(isPresalePhase || isPublicSalePhase) && (
                <Typography
                  textAlign="center"
                  variant="subtitle1"
                  color="secondary"
                >
                  Presale starts at June 9th, 8:00 pm EST
                </Typography>
              )}
              <Box
                justifyContent="center"
                alignItems="center"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: "20px",
                  textAlign: "center",
                }}
              >
                {hasAlreadyMintedPack ? (
                  <Typography>
                    {
                      "Oops! Looks like you have already minted 1 TeamDiff Starter Pack. Trade for more cards on "
                    }
                    <Link>
                      <a
                        className="primary-link"
                        target="_blank"
                        href={
                          "https://testnets.opensea.io/assets/" +
                          gameItemsContract.address
                        }
                        rel="noreferrer"
                      >
                        OpenSea
                      </a>
                    </Link>
                    {" or wait until our next drop."}
                  </Typography>
                ) : (
                  <>
                    {!isOnWhitelist && isPresalePhase && (
                      <Typography
                        style={{
                          // color: "red",
                          fontSize: 16,
                        }}
                      >
                        {"Oops! Looks like you aren't on the whitelist for the premint. Contact us on Discord if " +
                          " you think this is wrong, or come back tomorrow for public sale! "}
                      </Typography>
                    )}
                    {!(isPresalePhase || isPublicSalePhase) && (
                      <Typography
                        style={{
                          // color: "red",
                          fontSize: 16,
                        }}
                      >
                        {"Please come back when presale begins!"}
                      </Typography>
                    )}
                  </>
                )}
                {!isPolygon &&
                  !hasAlreadyMintedPack &&
                  !(!isOnWhitelist && isPresalePhase) &&
                  (isPresalePhase || isPublicSalePhase) && (
                    <Typography
                      style={{
                        color: "red",
                        fontSize: 16,
                      }}
                    >
                      Please switch to Polygon and refresh the page to proceed
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
                  flexDirection: "row",
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
                    }}
                  >
                    <Typography
                      sx={{ marginRight: 2 }}
                      variant="h4"
                      color="white"
                      component="div"
                    >
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
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          marginRight: 3,
                        }}
                      >
                        <Typography variant="h5"> Contents </Typography>
                        <Link>
                          <a
                            className="primary-link"
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
                        </Link>
                        {/* <Typography variant="subtitle2"> 
                      Note that it may take a few minutes for images and metadata to
                      properly load on OpenSea.
                    </Typography>                */}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
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
                      onClick={() => router.push("./collection")}
                      sx={{ marginTop: 5, fontSize: 20 }}
                    >
                      Go To My Collection
                    </Fab>
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
          {!isConnected && !hasMinted && !isMinting && !isNoMetaMask && (
            <Box>
              <ConnectWalletPrompt
                accessing={"minting a TeamDiff Starter Pack"}
              />
            </Box>
          )}
          {packsAvailable == 0 && (
            <Box>
              <Typography>
                Sorry, all packs have already been minted :(
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
