import {
  useAccount,
  useConnect,
  useSigner,
  useProvider,
  useContract,
  useEnsLookup,
} from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import Image from "next/image";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AthleteCard from "../components/AthleteCard";

import {
  Link,
  Box,
  CircularProgress,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
  Grid,
} from "@mui/material";
// import CONSTANTS from "../Constants.js";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import GameItemsJSON from "../../backend/contractscripts/contract_info/abis/GameItems.json";
import AthleteCard from "../components/AthleteCard";
import profilePic from "../assets/images/starter-pack.png";
import constants from "../Constants";

export default function BurnPack({ setDisplay }) {
  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );

  //State Hooks
  const [mintedPackId, setMintedPackId] = useState(null);
  const [gameItemsContract, setGameItemsContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [mintedIndices, setMintedIndices] = useState(null);
  const [canMint, setCanMint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [nftResp, setNFTResp] = useState(null);
  // const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);

  useEffect(() => {
    // setHasMinted(true);
    // setMintedIndices([6, 33, 12, 26, 45]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const sig ner = provider.getSigner()
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
        setIsLoading(false)
      }
      setAccountData()
      provider.provider.on('accountsChanged', (accounts) => { setAccountData() })
      provider.provider.on('disconnect', () =>  { console.log("disconnected"); 
                                                  setIsConnected(false) })
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
      

      //Fetcher to retireve newly minted NFT data
      const getNFTData = async (athleteIndices) => {
        console.log("athletic Indices in getNFTData: " + athleteIndices);
        const web3 = createAlchemyWeb3(constants.ALCHEMY_LINK);
        const nfts = await web3.alchemy.getNfts({
          owner: connectedAccount,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        }).catch((error) => {
            console.log("get NFT DATA error: " + JSON.stringify(error, null, 2));
        });

        setNFTResp(nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: CONTRACT_ADDRESSES.GameItems,
            tokenId: token,
          });
          console.log("Token #" + parseInt(token));
          if (!response.title?.includes("Pack") && athleteIndices.includes(parseInt(token))) {
            // console.log("Token #" + parseInt(token) + " metadata: " + JSON.stringify(response, null, 2));

            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
          }
        }
      };
      // getNFTData()
      // getNFTData([6, 33, 12, 26, 45]).catch((error) => {
      //   console.log("fetch NFT DATA error: " + JSON.stringify(error, null, 2));
      // });
      // athleteNFTs.forEach((athlete, index) => {
      //   console.log("Token #" + parseInt(index) + " metadata: " + JSON.stringify(athlete, null, 2));
      // })
      
      // Callback for when pack bur;ned function is called from GameItems contracts
      const packBurnedCallback = async (athleteIndices, signer) => {
        if (signer == connectedAccount) {
          setIsMinting(false);
          setIsTransactionDelayed(false);
          const test = [6, 33, 12, 26, 45];
          console.log("athleteIndices: " + test)
          
          setHasMinted(true);
          setMintedIndices(athleteIndices);

          await getNFTData(athleteIndices).catch((error) => {
            console.log("fetch NFT DATA error: " + JSON.stringify(error, null, 2));
          });
          // console.log("Finsihed minting indexes: " + athleteIndices[0] + ", " + athleteIndices[1] + ", " + athleteIndices[2] + ", " + athleteIndices[3] + ", " + athleteIndices[4]);
        }
      };

      // packBurnedCallback([6, 33, 12, 26, 45], "0xD926A3ddFBE399386A26B4255533A865AD98f7E3")
      // const test = [6, 33, 12, 26, 45];
      // console.log("athleteIndices: " + test)
      const fetchData = async () => {
        // console.log("connected Accotun :" + connectedAccount)
        const balanceOfPacks = await GameItemsContract.balanceOf(connectedAccount, 50);
        // console.log("balance of packs" + balanceOfPacks);
        setCanMint(balanceOfPacks > 0);
      }
      fetchData();

      // Listen to event for when pack burn function is called
      GameItemsContract.once("packBurned", packBurnedCallback);
    } else {
      console.log("no account data found!");
    }
  }, [isConnected]);

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

      //Calling burn on game items contract
      const burnTxn = await gameItemsContractWithSigner
        .burnStarterPack({
          gasLimit: 10000000,
        })
        .then((res) => {
          console.log("txn result: " + JSON.stringify(res, null, 2));
          setIsMinting(true);
          window.setTimeout(() => {setIsTransactionDelayed(true)}, 60 * 5 * 1000) 
          console.log("Minting pack in progress...");
        })
        .catch((error) => {
          alert("error: " + error.message);
        });
    
  };

  return (
    <Box>
        {isLoading ? (
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
            Loading
          </Typography>
          <br></br>
          <CircularProgress />
        </Box>
      </Container>
      ) : (
        <>
      {isConnected && !(hasMinted) && 
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
                Burn Starter Pack
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
                disabled={!canMint}
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
                Burn 
              </Fab>
              </Box>
            </>
          )}
            {!canMint && 
            <Box 
              sx={{
                display: "flex",
                justifyContent: "center"
              }}
            >
              <Typography>
                {"\nLooks like you don't have a starter pack yet. Head "}
                <Link>
                <a
                // style={{
                //   textDecoration: "none",
                //   textDecorationColor: "transparent"
                // }}
                class="primary-link"
                href="/mintPack"> 
                  here
                </a>      
                </Link>          
                { " to mint one now!"}
              </Typography>
            </Box>
            }
        </Container>
      }
      {isMinting && (
        <>
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
              Burning Pack...
            </Typography>
            <br></br>
            <CircularProgress />
            <br></br>
            {isMinting && isTransactionDelayed && (
              
              <Typography variant="p" textAlign={"center"}>
                This is taking longer than normal. Please check your wallet to check the status of this transaction.
              </Typography>
            )}
          </Box>
        </Container>
       
        </>
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
                 alignItems: "center",
                 justifyContent: "flex-start"
               }}
             >
                <Typography sx={{marginRight: 2}} variant="h4" color="white" component="div">
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
                  justifyContent: "space-between"
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
                      background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                      flex: 1,
                      marginRight: 3,
                      padding: 2
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
                 // onClick={() => setDisplayCollection(true)}
                 sx={{ marginTop: 5, fontSize: 20 }}
               >
                 Go To My Collection
               </Fab>
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
        <Box>
          <Typography variant="h6" component="div">
            Please connect your wallet to get started.
          </Typography>
        </Box>      
      )}
      </>
      )}
    </Box>
  );
}
