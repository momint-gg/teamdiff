import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import AthleteCard from "../components/AthleteCard";
import { Box, Container, Fab, Link, Paper, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
// import CONSTANTS from "../Constants.js";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import profilePic from "../assets/images/starter-pack.png";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt.js";
import LoadingPrompt from "../components/LoadingPrompt";

export default function BurnPack({ setDisplay }) {
  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  // Router
  const router = useRouter();

  // State Hooks
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
  // const [nftResp, setNFTResp] = useState(null);
  // // const [packNFTs, setPackNFTs] = useState([]);
  // const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [isPreRevealPhase, setIsPreRevealPhase] = useState();
  const [isPolygon, setIsPolygon] = useState();
  const [hasAlreadyBurnedPack, setHasAlreadyBurnedPack] = useState();

  function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      console.log("Ethereum successfully detected!");
      // Access the decentralized web!
    } else {
      //      alert("Redirecting to MetaMask Browser to use this Dapp on Mobile...");
      window.location.assign("https://metamask.app.link/dapp/teamdiff.xyz/");
      console.log("Please install MetaMask!");
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
      // setHasMinted(true);
      // setMintedIndices([6, 33, 12, 26, 45]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const sig ner = provider.getSigner()
      const setAccountData = async () => {
        const signer = provider.getSigner();
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const accountAddress = await signer.getAddress();

          setSigner(signer);
          setConnectedAccount(accountAddress);
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
    } else {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      });

      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000); // 3 seconds
    }
  }, [connectedAccount]);

  // Use Effect for change in if user isConnected
  useEffect(() => {
    // setAthleteNFTs([]);
    if (isConnected) {
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
          console.log("athleteIndices: " + test);

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
          await GameItemsContract.userToHasBurnedPack(connectedAccount);
        setHasAlreadyBurnedPack(hasAlreadyBurnedPack1);

        // Set if is past presale date
        // open sale start date in UTC
        const revealStartDate = new Date("June 13, 2022 21:00:00");
        // const revealStartDate = new Date("June 6, 2022 21:00:00");
        const today = new Date();
        const isBeforeRevealDate = today.getTime() < revealStartDate.getTime();
        setIsPreRevealPhase(isBeforeRevealDate);
      };
      fetchData();

      // Listen to event for when pack burn function is called
      GameItemsContract.once("packBurned", packBurnedCallback);
    } else {
      console.log("no account data found!");
    }
  }, [isConnected, connectedAccount]);

  // TODO hide burn pack if they don't
  const burnStarterPack = async () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()
    // Create a new instance of the Contract with a Signer, which allows update methods

    const gameItemsContractWithSigner = new ethers.Contract(
      CONTRACT_ADDRESSES.GameItems,
      GameItemsJSON.abi,
      signer
    );
    // setIsMinting(true);

    // window.setTimeout(() => {setIsTransactionDelayed(true)}, 10000)

    // Calling burn on game items contract
    const burnTxn = await gameItemsContractWithSigner
      .burnStarterPack({
        gasLimit: 10000000,
      })
      .then((res) => {
        console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsMinting(true);
        window.setTimeout(() => {
          setIsTransactionDelayed(true);
        }, 20 * 1000);
        console.log("Minting pack in progress...");
      })
      .catch((error) => {
        alert("error: " + error.message);
      });
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingPrompt loading={"Open Page"} />
      ) : (
        <>
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
                    // height="450px"
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
                        isPreRevealPhase
                      }
                      // onClick={() => setDisplayMint(true)}
                      sx={{
                        marginRight: 1,
                        marginBottom: 2,
                        background:
                          "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      Open
                    </Fab>
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
                      Revealing TeamDiff Starter Packs unlocks June 13th, 5:00
                      pm EST
                    </Typography>
                    <Typography>
                      Come back after the reveal date to open your pack!
                    </Typography>
                  </>
                )}
                <br></br>
                {!ownsStarterPack && !hasAlreadyBurnedPack && (
                  <Typography>
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
                  <Typography>
                    {
                      "Oops! Looks like you have already opened 1 TeamDiff Starter Pack. Trade for more cards on "
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
                )}
              </Box>
            </Container>
          )}
          {isMinting && (
            <LoadingPrompt
              completeTitle={"Opening Pack..."}
              bottomText={
                isTransactionDelayed && isMinting
                  ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
                  : ""
              }
            />
          )}
          {hasMinted && (
            <>
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
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography
                        sx={{ marginRight: 2 }}
                        variant="h4"
                        color="white"
                        component="div"
                      >
                        Acquired 5 TeamDiff Athletes!
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
                        {mintedIndices?.map((index) => (
                          <Link
                            href={
                              "https://testnets.opensea.io/assets/" +
                              gameItemsContract.address +
                              "/" +
                              index
                            }
                            // href=""
                            target="_blank"
                          >
                            <Paper
                              elevation={5}
                              sx={{
                                background:
                                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                                flex: 1,
                                marginRight: 3,
                                padding: 2,
                              }}
                            >
                              <Typography variant="h5">
                                {"Athlete #" + index}
                              </Typography>
                            </Paper>
                          </Link>
                        ))}

                        {/* {athleteNFTs?.map((athlete) => (
                   <Box
                    sx={{
                      flex: 1,
                      marginRight: 3
                    }}
                  >
                    <Typography variant="h5"> 
                      {"Athlete #" + parseInt(athlete.id.tokenId) + ": " + athlete.metadata.name}
                    </Typography>
                    {/* <AthleteCard
                      athleteData={athlete}
                      // setAthlete={setCurrAthlete}
                      // setModalOpen={setModalOpen}
                    /> }
                    <a
                      href={
                        "https://testnets.opensea.io/assets/" +
                        gameItemsContract.address +
                        "/" +
                        parseInt(athlete.id.tokenId)
                      }
                      target="_blank"
                      // href=""
                    >
                      {"View on OpenSea."}
                    </a>
                 </Box>
                 
                  
                ))} */}
                      </Box>
                      <hr></hr>
                      <Typography variant="h6">
                        Click any card to view on OpenSea
                      </Typography>
                    </Box>
                    <Fab
                      variant="extended"
                      size="large"
                      color="white"
                      aria-label="add"
                      //  target={"_blank"}
                      onClick={() => router.push("./collection")}
                      sx={{ marginTop: 5, fontSize: 20 }}
                    >
                      Go To My Collection
                    </Fab>
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
          {!isConnected && !hasMinted && !isMinting && (
            <ConnectWalletPrompt
              accessing={"opening a TeamDiff Starter pack"}
            />
          )}
        </>
      )}
    </Box>
  );
}
