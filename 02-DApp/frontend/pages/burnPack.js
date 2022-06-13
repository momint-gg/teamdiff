import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Container,
  Fab,
  Grid,
  Link,
  Paper,
  Typography
} from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
// import CONSTANTS from "../Constants.js";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import cardImage from "../assets/images/mystery_card.png";
import OpenSea from "../assets/images/opensea.png";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt.js";
import LoadingPrompt from "../components/LoadingPrompt";
import MetaMaskRedirectInstructions from "../components/MetaMaskRedirectInstructions";
import AthletesToIndex from "../constants/AlthletesToIndex.json";

function getAthleteImage(id) {
  const athleteName = AthletesToIndex[id];
  return `/cards/${athleteName}.png`;
}

export default function BurnPack({ setDisplay }) {
  // TODO change to matic network for prod
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.POLYGON_ALCHEMY_KEY
  );
  // Router
  const router = useRouter();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // State Hooks
  const [mintedPackId, setMintedPackId] = useState(null);
  const [gameItemsContract, setGameItemsContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [mintedIndices, setMintedIndices] = useState(null);
  const [ownsStarterPack, setOwnsStarterPack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [isPreRevealPhase, setIsPreRevealPhase] = useState();
  // const [isPolygon, setIsPolygon] = useState();
  const [hasAlreadyBurnedPack, setHasAlreadyBurnedPack] = useState();

  const [isNoMetaMask, setIsNoMetaMask] = useState();

  /**
   * Handles a change in injected etheruem provider from MetaMask
   */
  function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      // console.log("Ethereum successfully detected!");
      // Access the decentralized web!
    } else {
      setIsNoMetaMask(true);
      setIsLoading(false);

      // alert("Close this alert to redirect to MetaMask Mobile Browser");
      // window.open("https://metamask.app.link/dapp/teamdiff.xyz/");
      // console.log("Please install MetaMask!");
    }
  }
  const [nftResp, setNFTResp] = useState(null);
  // const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [currentChain, setCurrentChain] = useState();
  const [isPolygon, setIsPolygon] = useState();

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
          setIsConnected(true);
          const { chainId } = await provider.getNetwork();
          setCurrentChain(chainId);
          setIsPolygon(chainId === 137);
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
        // console.log("disconnected");
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
  }, [connectedAccount]);

  /**
   * Runs when connectedAccount changes
   * Sets a GameITems instance to state var
   * Grabs the connectedAccount data from GameItems
   */
  useEffect(() => {
    // setAthleteNFTs([]);
    if (isConnected) {
      setIsLoading(true);

      // Initialize connections to GameItems contract
      const GameItemsContract = new ethers.Contract(
        CONTRACT_ADDRESSES.GameItems,
        GameItemsJSON.abi,
        provider
      );
      setGameItemsContract(GameItemsContract);

      // Callback for when pack bur;ned function is called from GameItems contracts
      const packBurnedCallback = async (athleteIndices, signer) => {
        if (signer == connectedAccount) {
          setIsMinting(false);
          setIsTransactionDelayed(false);
          const test = [6, 33, 12, 26, 45];
          // console.log("athleteIndices: " + test);

          setHasMinted(true);
          setMintedIndices(athleteIndices);
        }
      };

      const fetchData = async () => {
        // console.log("connected Accotun :" + connectedAccount)
        const balanceOfPacks = await GameItemsContract.balanceOf(
          connectedAccount,
          50
        );
        // console.log("balance of packs" + balanceOfPacks);
        setOwnsStarterPack(balanceOfPacks > 0);

        // Grab if user has already minted starter pack
        const hasAlreadyBurnedPack1 =
          await GameItemsContract.userToHasBurnedStarterPack(connectedAccount);
        setHasAlreadyBurnedPack(hasAlreadyBurnedPack1);

        // Set if is past presale date
        // open sale start date in UTC
        // const revealStartDate = new Date("June 13, 2022 21:00:00");
        // // const revealStartDate = new Date("June 6, 2022 21:00:00");
        // const today = new Date();
        // const isBeforeRevealDate = today.getTime() < revealStartDate.getTime();
        const isRevealPhase = await GameItemsContract.packsReadyToOpen();

        setIsPreRevealPhase(!isRevealPhase);
        console.log("isPreveal: " + isRevealPhase);
        setIsLoading(false);
      };
      fetchData();
      // console.log("isPreveal out: " + isPreRevealPhase);

      // Listen to event for when pack burn function is called
      GameItemsContract.on("starterPackBurned", packBurnedCallback);
    } else {
      // console.log("no account data found!");
      setIsLoading(false);
    }
  }, [isConnected, connectedAccount]);

  /**
   * Creates GameITmes instance with connected Account as signer
   * Calls burnStarterPack from GameItems Contract
   */
  const burnStarterPack = async () => {
    // Create a new instance of the Contract with a Signer, which allows update methods
    const gameItemsContractWithSigner = new ethers.Contract(
      CONTRACT_ADDRESSES.GameItems,
      GameItemsJSON.abi,
      signer
    );

    // Calling burn on game items contract
    await gameItemsContractWithSigner
      .burnStarterPack({
        gasLimit: 10000000,
      })
      .then((res) => {
        // console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsMinting(true);
        window.setTimeout(() => {
          setIsTransactionDelayed(true);
        }, 10 * 1000);
        // console.log("Minting pack in progress...");
      })
      .catch((error) => {
        if (error.data?.message) {
          alert("error: " + error.data.message);
        } else {
          alert("error:" + error.message);
        }
      });
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingPrompt loading={"Open Page"} />
      ) : (
        <>
          {isNoMetaMask && <MetaMaskRedirectInstructions />}

          {isConnected && !hasMinted && (
            <Container
              maxWidth="lg"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                justifyContent="center"
                alignItems="center"
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  marginTop: 4,
                  "& > :not(style)": {
                    m: 1,
                    width: 260,
                    height: 300,
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
                    src={cardImage}
                    alt="Picture of the author"
                    position="absolute"
                  />
                </Container>
              </Box>
              {!(isMinting || hasMinted) && (
                <>
                  <Box
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    sx={{
                      display: "flex",
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    <Typography variant="h4" color="white" component="div">
                      Open TeamDiff Starter Pack
                    </Typography>
                  </Box>
                  <Box
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      paddingTop: "20px",
                    }}
                  >
                    <Fab
                      variant="extended"
                      size="large"
                      aria-label="add"
                      onClick={burnStarterPack}
                      disabled={
                        !ownsStarterPack ||
                        hasAlreadyBurnedPack ||
                        isPreRevealPhase ||
                        !isPolygon
                      }
                      // onClick={() => setDisplayMint(true)}
                      sx={{
                        marginRight: 1,
                        marginBottom: 2,
                        background:
                          "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                        color: "white",
                        fontSize: 20,
                        paddingRight: 6,
                        paddingLeft: 6,
                      }}
                    >
                      Open
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
                        Please switch to Polygon, then refresh the page, to
                        proceed with opening.
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                {isPreRevealPhase && (
                  <>
                    <Typography variant="subtitle1" color="secondary">
                      Revealing TeamDiff Starter Packs unlocks June 13th, at
                      5:00 pm EST
                    </Typography>
                    <Typography color="primary">
                      Come back after the reveal date to open your pack!
                    </Typography>
                  </>
                )}
                <br></br>
                {!ownsStarterPack && !hasAlreadyBurnedPack && (
                  <Typography color="primary">
                    {"\nLooks like you don't have a starter pack yet. Head "}
                    <Link>
                      <a className="primary-link" href="/mintPack">
                        here
                      </a>
                    </Link>
                    {" to mint one now!"}
                  </Typography>
                )}
                {hasAlreadyBurnedPack && (
                  <Typography color="primary" variant="h5">
                    {
                      "Oops! Looks like you have already opened 1 TeamDiff Starter Pack. Trade for more cards on "
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
                )}
              </Box>
            </Container>
          )}
          {isMinting && (
            <Box sx={{ marginTop: 5 }}>
              <LoadingPrompt
                completeTitle={"Opening Pack..."}
                bottomText={
                  isTransactionDelayed && isMinting
                    ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
                    : ""
                }
              />
            </Box>
          )}
          {hasMinted && (
            <>
              <Container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
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
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{ marginRight: 2 }}
                        variant="h3"
                        color="white"
                        component="div"
                      >
                        Acquired 5 TeamDiff Athletes!
                      </Typography>
                      {!isMobile && (
                        <CheckCircleIcon
                          fontSize="large"
                          sx={{ color: "#13db13" }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                        marginBottom: 2,
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ color: "#cdcdcd", marginRight: 1 }}
                      >
                        Click any card to view on OpenSea
                      </Typography>
                      {!isMobile && (
                        <Image
                          src={OpenSea}
                          alt={"opensea"}
                          width="30rem"
                          height="30rem"
                        />
                      )}
                    </Box>
                    <Typography color="primary" sx={{ marginBottom: 5 }}>
                      *Note, it can take a few minutes for the NFT metadata and
                      image to populate on OpenSea
                    </Typography>
                    <Box>
                      <Grid container spacing={6}>
                        {mintedIndices?.map((index) => (
                          <Grid item xs={isMobile ? 12 : 4}>
                            <Link
                              href={
                                "https://opensea.io/assets/matic/" +
                                gameItemsContract.address +
                                "/" +
                                index
                              }
                              target="_blank"
                            >
                              <img
                                src={getAthleteImage(index)}
                                alt={"image"}
                                loading="lazy"
                                width="300px"
                                style={{
                                  filter: "drop-shadow(0 0 0.75rem crimson)",
                                }}
                              />
                            </Link>
                          </Grid>
                        ))}
                      </Grid>
                      <br></br>
                    </Box>
                    <Fab
                      variant="extended"
                      size="large"
                      color="white"
                      aria-label="add"
                      //  target={"_blank"}
                      onClick={() => router.push("./collection")}
                      sx={{
                        marginTop: 5,
                        fontSize: 20,
                        paddingRight: 5,
                        paddingLeft: 5,
                      }}
                    >
                      Go To My Collection
                    </Fab>
                  </Box>
                  {/* <Box
                    sx={{
                      flex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={cardImage}
                      alt="Picture of the author"
                      // height="100%"
                      // width="auto"
                      width="155px"
                      height="225px"
                    />
                  </Box> */}
                </Box>
              </Container>
              {/* <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography>Your Starter Pack has been burned</Typography>
          {/* TODO: show a collection of their newly minted athlete cards on the screen */}
            </>
          )}
          {!isConnected && !hasMinted && !isMinting && !isNoMetaMask && (
            <ConnectWalletPrompt
              accessing={"opening a TeamDiff Starter pack"}
            />
          )}
        </>
      )}
    </Box>
  );
}
