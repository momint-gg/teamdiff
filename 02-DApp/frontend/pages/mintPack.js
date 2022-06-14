import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Container, Fab, Link, Paper, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import { ethers } from "ethers";
import Image from "next/image";
// Router
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import profilePic from "../assets/images/starter-pack.png";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import MetaMaskRedirectInstructions from "../components/MetaMaskRedirectInstructions";

export default function MintPack() {
  // Router
  const router = useRouter();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
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
  const [isPresalePhase, setIsPresalePhase] = useState(true);
  const [isPublicSalePhase, setIsPublicSalePhase] = useState(false);
  const [isNoMetaMask, setIsNoMetaMask] = useState();

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
      // window.open("https://metamask.app.link/dapp/teamdiff.xyz/");
      console.log("Please install MetaMask!");
    }
  }

  /**
   * Checks if browsers has injected web3 provider
   * and if so, gets connected account data, or sets to null if no connected account
   */
  useEffect(() => {
    if (window.ethereum) {
      setIsLoading(true);
      handleEthereum();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

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
          setIsLoading(false);
        }
        // setIsLoading(false);
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

  /**
   * Checks To ensure the user is connected to Polygon for minting
   */
  const checkUserChain = () => {
    if (!currentChain || currentChain != 137) {
      // if (currentChain === 1) {
      //   // in the future we can potentially switch networks for them using useNetwork wagmi hook?
      //   alert(
      //     "Uh oh, you are currently on the Ethereum mainnet. Please switch to Polygon to proceed with the mint."
      //   );
      // }
      // } else {
      //   alert("Please switch to the Polygon network to proceed with the mint!")
      // }
    }
  };

  /**
   * Runs when connectedAccount changes
   * Sets a GameITems instance to state var
   * Grabs the connectedAccount data from GameItems
   */
  useEffect(() => {
    if (isConnected) {
      checkUserChain();

      // Initialize connections to GameItems contract
      const GameItemsContract = new ethers.Contract(
        CONTRACT_ADDRESSES.GameItems,
        GameItemsJSON.abi,
        provider
      );
      setGameItemsContract(GameItemsContract);

      const fetchData = async () => {
        setIsLoading(true);

        // Grab packs available
        const packsAvail = await GameItemsContract.packsAvailable();
        setPacksAvailable(packsAvail.toNumber());

        // Grab if user has already minted starter pack
        const hasAlreadyMintedPack1 =
          await GameItemsContract.userToHasMintedStarterPack(connectedAccount);
        setHasAlreadyMintedPack(hasAlreadyMintedPack1);

        // Grab if user is on whitelist
        const isOnWhitelist1 = await GameItemsContract.whitelist(
          connectedAccount
        );
        setIsOnWhitelist(isOnWhitelist1);

        // Set if is past presale date
        const isPresale = await GameItemsContract.isPresalePhase();
        const isPublicSale = await GameItemsContract.isPublicSalePhase();
        setIsPresalePhase(isPresale);
        setIsPublicSalePhase(isPublicSale);
        console.log("ispublic: " + isPublicSale);

        setIsLoading(false);
      };
      fetchData();
      // Callback for when packMinted Events is fired from contract
      const packMintedCallback = (signerAddress, packID) => {
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
      GameItemsContract.on("starterPackMinted", packMintedCallback);
    } else {
      // console.log("no account connected");
      setIsLoading(false);
    }
  }, [isConnected, connectedAccount]);

  /**
   * Creates GameItems instance with connectedAccount as signer
   * then calls mintStarterPack from GameItems
   */
  const mintStarterPack = async () => {
    // Create a new instance of the Contract with a Signer, which allows update methods
    const gameItemsContractWithSigner = new ethers.Contract(
      CONTRACT_ADDRESSES.GameItems,
      GameItemsJSON.abi,
      signer
    );

    await gameItemsContractWithSigner
      .mintStarterPack()
      .then((res) => {
        setIsMinting(true);
        window.setTimeout(() => {
          setIsTransactionDelayed(true);
        }, 10 * 1000);
      })
      .catch((error) => {
        if (error.data?.message) {
          alert("error: " + error.data.message);
        } else {
          alert("error: " + error.message);
        }
        // console.log("error: " + JSON.stringify(error, null, 2));
      });
  };

  return (
    <Box>
      {!isConnected && !hasMinted && !isMinting ? (
        <ConnectWalletPrompt accessing={"minting a pack"} />
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
                    paddingRight: 8,
                    paddingLeft: 8,
                  }}
                  // disabled={!isPolygon}
                  disabled={
                    hasAlreadyMintedPack ||
                    // (!isOnWhitelist && isPresalePhase) ||
                    !(isPresalePhase || isPublicSalePhase) ||
                    !isPolygon
                  }
                >
                  Mint
                </Fab>
              </Box>

              <br></br>
              {isPresalePhase && !isPublicSalePhase && (
                <Typography
                  textAlign="center"
                  variant="subtitle1"
                  color="secondary"
                >
                  Presale ends June 11th, 5:00 pm EST
                </Typography>
              )}
              {!(isPresalePhase || isPublicSalePhase) && (
                <Typography
                  textAlign="center"
                  variant="subtitle1"
                  color="secondary"
                >
                  Presale starts June 10th, at 8:00 pm EST
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
                  <Typography color="primary" variant="h5">
                    {
                      "Oops! Looks like you have already minted 1 TeamDiff Starter Pack. Trade for more cards on "
                    }
                    <Link>
                      <a
                        className="primary-link"
                        target="_blank"
                        href={
                          "https://opensea.io/assets/matic/" +
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
                    {!isOnWhitelist && isPresalePhase && !isPublicSalePhase && (
                      <Typography color="primary" variant="h5">
                        {"Oops! Looks like you aren't on the whitelist for the premint. Contact us on Discord if " +
                          " you think this is wrong, or come back tomorrow for public sale! "}
                      </Typography>
                    )}
                    {!(isPresalePhase || isPublicSalePhase) && (
                      <Typography color="primary" variant="h5">
                        {"Please come back when presale begins!"}
                      </Typography>
                    )}
                  </>
                )}
                {!isPolygon && (
                  // !hasAlreadyMintedPack &&
                  // !(!isOnWhitelist && isPresalePhase) &&
                  // (isPresalePhase || isPublicSalePhase) && (
                  <Typography
                    variant="h5"
                    style={{
                      background:
                        "linear-gradient(95.66deg, #5A165B 60%, #AA10AD 100%)",
                      filter: "blur(35px)",
                    }}
                  >
                    {`Please switch to Polygon and refresh the page to proceed 
                    with minting. If you don't already have Polygon configured
                    in your wallet, follow these instructions `}
                    <Link
                      href="https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask#polygon-scan"
                      rel="noreferrer"
                      target="_blank"
                    >
                      here.
                    </Link>
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
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: "2rem",
                    }}
                  >
                    <Typography
                      sx={{ marginRight: 2, textAlign: "center" }}
                      variant="h5"
                      color="white"
                      component="div"
                    >
                      Acquired Starter Pack!
                    </Typography>
                    {!isMobile && (
                      <CheckCircleIcon
                        fontSize="large"
                        sx={{ color: "#13db13" }}
                      />
                    )}
                  </Box>
                  {isMobile && (
                    <Box
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
                  )}
                  <Box>
                    <Box
                      sx={{
                        flex: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          marginRight: 3,
                          textAlign: "center",
                          marginBottom: isMobile ? "1rem" : "0",
                        }}
                      >
                        <Typography color="primary" variant="h5">
                          {" "}
                          Pack #
                        </Typography>
                        <Typography
                          variant="h5"
                          color="secondary"
                          sx={{ fontWeight: "bold" }}
                        >
                          {" "}
                          {500 - packsAvailable}{" "}
                          {/** TODO: sett this to packs minted instead */}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 3,
                          textAlign: "center",
                        }}
                      >
                        <Link
                          href={
                            "https://opensea.io/assets/matic/" +
                            gameItemsContract.address +
                            "/50" // the pack Id is after the athletes (not 0)
                          }
                          sx={{ textDecoration: "none" }}
                          target={"_blank"}
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
                            <Box sx={{ marginLeft: 1 }}>View on OpenSea</Box>
                          </Fab>
                        </Link>
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
                    {!isMobile && (
                      <Box
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
                    )}
                  </Box>
                </Container>
              )}
              {packsAvailable == 0 && (
                <Box>
                  <Typography color="primary">
                    Sorry, all packs have already been minted :(
                  </Typography>
                </Box>
                {!isMobile && (
                  <Box
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
                )}
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
              <Typography color="primary" variant="h5">
                Sorry, all packs have already been minted :(
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
