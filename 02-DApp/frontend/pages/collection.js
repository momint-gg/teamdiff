import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import {
  Box,
  Card,
  Fab,
  FormControl,
  Grid,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import InputLabel from "@mui/material/InputLabel";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import OpenSea from "../assets/images/opensea.png";
import AthleteCardModal from "../components/AthleteCardModal";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import MetaMaskRedirectInstructions from "../components/MetaMaskRedirectInstructions";
import constants from "../constants";
// import styles from "../styles/collection.module.css"

// const StyledImageListItem = styled(ImageListItem)`
//   &:hover {
//     cursor: pointer;

//   }
// `

export default function Collection() {
  const router = useRouter();
  // State Hooks
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoMetaMask, setIsNoMetaMask] = useState();

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

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
      window.open("https://metamask.app.link/dapp/teamdiff.xyz/");
      console.log("Please install MetaMask!");
    }
  }
  const [searchQuery, setSeachQuery] = useState("");
  const [isPreparingAthletes, setIsPreparingAthletes] = useState(true);
  const [allTeamFilterOptions, setAllTeamFilterOptions] = useState([]);
  const [teamFilterSelection, setTeamFilterSelection] = useState("");
  const [teamPositionSelection, setTeamPositionSelection] = useState("");
  const [athleteNFTsWrapper, setAthleteNFTsWrapper] = useState([]);
  const [loadingError, setLoadingError] = useState(false)

  /**
   * Checks if browsers has injected web3 provider
   * and if so, gets connected account data, or sets to null if no connected account
   */
  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const setAccountData = async () => {
        const signer = provider.getSigner();
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const accountAddress = await signer.getAddress();
          setConnectedAccount(accountAddress);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        setIsLoading(false);
      };
      setAccountData();
      provider.provider.on("accountsChanged", () => {
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
  }, []);

  // const handleModalOpen = () => {
  //   setModalOpen(true);
  // };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  useEffect(async () => {
    setPackNFTs([]);
    setAthleteNFTs([]);
    setAthleteNFTsWrapper([]);
    // declare the async data fetching function
    if (isConnected) {
      // Get the owned GAmeItems ERC-1155s from the connectedAccount
      const getNFTData = async () => {
//         console.log("entering getNftData function")
        const web3 = createAlchemyWeb3(constants.POLYGON_ALCHEMY_LINK)
        // const web3 = createAlchemyWeb3(constants.RINKEBY_ALCHEMY_LINK).catch(
        //   (error) => {
        //     // alert("fetch create alchemy web3 error: " + JSON.stringify(error, null, 2));
        //     // setNFTData([]);
        //     setIsPreparingAthletes(false);

        //     console.log(
        //       "create alchemy web3 error: " + JSON.stringify(error, null, 2)
        //     );
        //   }
        // );
//         console.log("finished createAlchemyweb")

        const nfts = await web3.alchemy
          .getNfts({
            owner: connectedAccount,
            contractAddresses: [CONTRACT_ADDRESSES.GameItems],
          })
          .catch((error) => {
            // alert("fetch create alchemy web3 error: " + JSON.stringify(error, null, 2));
            // setNFTData([]);
            setLoadingError(true)
            setIsPreparingAthletes(false);
            console.log("get nfts error: ");
          });

        setNFTResp(nfts);
        console.log("nftresp", nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: CONTRACT_ADDRESSES.GameItems,
            tokenId: token,
          });
          // console.log(
          //   "Token #" +
          //     token +
          //     " metadata: " +
          //     JSON.stringify(response, null, 2)
          // );

          // Check metadata of ERC-1155, and assing to create State list
          if (response.title?.includes("Pack")) {
            setPackNFTs((packNFTs) => [...packNFTs, response]);
          } else {
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
            setAthleteNFTsWrapper((athleteNFTsWrapper) => [
              ...athleteNFTsWrapper,
              response,
            ]);
          }
        }
      };

      await getNFTData().catch(() => {
        // alert("fetch NFT DATA error: " + JSON.stringify(error, null, 2));
        // setNFTData([]);
        // setIsPreparingAthletes(false);
        setLoadingError(true)
        console.log("fetch NFT DATA error");
      });
      console.log("done with preparing atheletes");
      // console.log(athleteNFTs, 'hmm')
      // setAthleteNFTsWrapper(athleteNFTs)
      setIsPreparingAthletes(false);
    }
  }, [isConnected, connectedAccount]);

  // const returnSearchResults = () => {
  //   return athleteNFTs.filter((athlete) => athlete.metadata.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
  // }

  const filterResults = (inputs) => {
    let athleteNFTsCopy = [...athleteNFTs];
    if (inputs.team) {
      athleteNFTsCopy = athleteNFTsCopy.filter((athlete) => {
        const attributesRaw = athlete.metadata.attributes;
        for (const a of attributesRaw) {
          if (
            a.trait_type.toLowerCase() === "team" &&
            a.value === inputs.team
          ) {
            return true;
          }
        }
        return false;
      });
    }
    if (inputs.position) {
      athleteNFTsCopy = athleteNFTsCopy.filter((athlete) => {
        const attributesRaw = athlete.metadata.attributes;
        for (const a of attributesRaw) {
          if (
            a.trait_type.toLowerCase() === "position" &&
            a.value === inputs.position
          ) {
            return true;
          }
        }
        return false;
      });
    }
    if (inputs.query) {
      athleteNFTsCopy = athleteNFTsCopy.filter(
        (athlete) =>
          athlete.metadata.name
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) !== -1
      );
    }

    return athleteNFTsCopy;
  };

  const getTeamFilterOptions = () => {
    const arr = [];
    for (const athlete of athleteNFTs) {
      const attributesRaw = athlete.metadata.attributes;
      console.log(attributesRaw, "***");
      for (const a of attributesRaw) {
        if (a.trait_type.toLowerCase() === "team") {
          arr.push(a.value);
        }
      }
    }
    // const allTeams = athleteNFTs.map((athlete) => athlete.metadata.team)
    console.log(arr, "lll");
    return [...new Set(arr)];
  };

  useEffect(() => {
    if (!isPreparingAthletes) {
      setAllTeamFilterOptions(getTeamFilterOptions());
      console.log("useeffect");
      setTimeout(() => {
        console.log(allTeamFilterOptions);
      }, 1000);
    }
  }, [isPreparingAthletes]);
  // const allTeamFilterOptions = getTeamFilterOptions()

  // const ALL_POSITION_FILTER_OPTIONS = {
  //   top: 'Top',
  //   adc: 'ADC',
  //   mid: 'Mid',
  //   jungle: 'Jungle',
  //   support: 'Support'
  // }

  const ALL_POSITION_FILTER_OPTIONS = [
    "Top",
    "ADC",
    "Mid",
    "Jungle",
    "Support",
  ];

  // handles any change in filter/query
  useEffect(() => {
    const filteredResults = filterResults({
      team: teamFilterSelection,
      query: searchQuery,
      position: teamPositionSelection,
    });
    console.log(filteredResults, "filtered");
    setAthleteNFTsWrapper(filteredResults);
  }, [teamFilterSelection, searchQuery, teamPositionSelection]);

  const handleTeamFilterChange = (e) => {
    const { name, value } = e.target;
    setTeamFilterSelection(value);
  };

  const handlePositionFilterChange = (e) => {
    setTeamPositionSelection(e.target.value);
  };

  const handleQueryChange = (e) => {
    setSeachQuery(e.target.value);
  };

  if (isNoMetaMask) {
    return <MetaMaskRedirectInstructions />;
  } else if (
    isConnected &&
    nftResp &&
    (allTeamFilterOptions.length !== 0 || packNFTs.length !== 0) &&
    !loadingError
  ) {
    return (
      // https://mui.com/material-ui/react-select/
      <Box>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          color="secondary"
          component="div"
          style={{ marginTop: 10 }}
        >
          My TeamDiff Athlete Cards
        </Typography>

        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />

        <Grid
          container
          spacing={isMobile ? 1 : 3}
          sx={{ marginBottom: "50px" }}
        >
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography
              variant={isMobile ? "h6" : "h4"}
              color="secondary.light"
              component="div"
            // fontSize={"50px"}
            >
              Filter Athletes:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              label="Name"
              value={searchQuery}
              onChange={handleQueryChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="position-filter">Position</InputLabel>
              <Select
                labelId="position-filter"
                value={teamPositionSelection}
                label="Position"
                onChange={handlePositionFilterChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {ALL_POSITION_FILTER_OPTIONS.map((positionOption) => (
                  <MenuItem value={positionOption}>{positionOption}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="team-filter">Team</InputLabel>
              <Select
                labelId="team-filter"
                value={teamFilterSelection}
                label="Team"
                onChange={handleTeamFilterChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {allTeamFilterOptions.map((teamOption) => (
                  <MenuItem value={teamOption}>{teamOption}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* <Box
            sx={{
              display: "flex",
              gap: "30px",
              alignItems: "center",
            }}
          >
            
          <Typography
            variant={isMobile ? "h6" : "h4"}
            color="secondary.light"
            component="div"
            // fontSize={"50px"}

          >
            Filter Athletes:
          </Typography>
          <TextField 
            label="Name"
            value={searchQuery}
            onChange={handleQueryChange}
            />
          <FormControl sx={{ minWidth: 250 }} >
          <InputLabel id="position-filter">Position</InputLabel>
          <Select
            labelId="position-filter"
            value={teamPositionSelection}
            label="Position"
            onChange={handlePositionFilterChange}
          >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {ALL_POSITION_FILTER_OPTIONS.map((positionOption) => (
              <MenuItem value={positionOption}>{positionOption}</MenuItem>
            ))}
            
          </Select>

        </FormControl>
          <FormControl sx={{ minWidth: 250 }} >
          <InputLabel id="team-filter">Team</InputLabel>
          <Select
            labelId="team-filter"
            value={teamFilterSelection}
            label="Team"
            onChange={handleTeamFilterChange}
          >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
            {allTeamFilterOptions.map((teamOption => (
              <MenuItem value={teamOption}>{teamOption}</MenuItem>
            )))}
            
          </Select>

        </FormControl>

          </Box> */}
        <Typography
          variant={isMobile ? "h8" : "h6"}
          color="secondary.light"
          component="div"
          sx={{
            marginBottom: "20px",
          }}
        >
          Showing {athleteNFTsWrapper.length} out of {athleteNFTs.length} total
          athletes.
        </Typography>

        <ImageList
          sx={{
            width: "100%",
            borderColor: "white",
            color: "white",
            borderRadius: 2,
            border: 1,
          }}
          cols={isMobile ? 1 : 3}
        >
          {athleteNFTsWrapper?.map((athleteData) => (
            <ImageListItem sx={{ margin: "5%" }} className="athlete-image">
              <img
                src={
                  "/cards/" +
                  athleteData?.title +
                  ".png?w=164&h=164&fit=crop&auto=format"
                }
                alt={"Athlete card"}
                loading="lazy"
                onClick={() => {
                  setCurrAthlete({
                    image:
                      "/cards/" +
                      athleteData?.title +
                      ".png?w=164&h=164&fit=crop&auto=format",
                    athleteData: athleteData,
                  });
                  setModalOpen(true);
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>

        {/* <Grid container spacing={isMobile ? 1 : 3} sx={{ marginBottom: "50px" }}>
            {athleteNFTsWrapper?.map((athleteData) => (
              <Grid item xs={isMobile ? 12 : 4}>
                <AthleteCard
                  athleteData={athleteData}
                  setAthlete={setCurrAthlete}
                  setModalOpen={setModalOpen} />
              </Grid>
            ))}
          </Grid> */}
        <AthleteCardModal
          modalOpen={modalOpen}
          image={currAthlete?.image}
          athleteData={currAthlete?.athleteData}
          handleModalClose={handleModalClose}
        />
        <Typography
          variant={isMobile ? "h4" : "h3"}
          color="secondary"
          component="div"
        >
          My TeamDiff Starter Packs
        </Typography>
        <hr
          style={{
            color: "white",
            backgroundColor: "white",
            height: 5,
          }}
        />
        <ImageList
          sx={{
            width: "100%",
            borderColor: "white",
            color: "white",
            borderRadius: 2,
            border: 1,
          }}
          cols={isMobile ? 1 : 3}
        >
          {packNFTs?.map((_) => (
            <ImageListItem sx={{ margin: "5%" }}>
              <img
                src={"/starter-pack.png?w=164&h=164&fit=crop&auto=format"}
                alt={"Starter pack image"}
                loading="lazy"
              />
            </ImageListItem>
          ))}
        </ImageList>
        {/* <Grid container spacing={isMobile ? 1 : 3} sx={{ marginBottom: "50px" }}>
            {packNFTs?.map((athleteData) => (
              <Grid item xs={isMobile ? 12 : 4}>
                <AthleteCard
                  athleteData={athleteData}
                  setAthlete={setCurrAthlete}
                  setModalOpen={setModalOpen} />
              </Grid>
            ))}
          </Grid> */}
      </Box>
    );
  } else if (isConnected && nftResp && !loadingError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Card
          sx={{
            textAlign: "center",
            padding: 3,
            color: "white",
            width: "30rem",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Empty Collection
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.1rem",
              marginTop: ".4rem",
              marginBottom: ".4rem",
              overflowWrap: "break-word",
            }}
          >
            You don't currently own any TeamDiff NFT's! Mint a starter pack, or
            purchase one on OpenSea.
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Fab
              variant="extended"
              size="large"
              aria-label="add"
              onClick={() => router.push("./mintPack")}
              sx={{
                fontSize: 20,
                background:
                  "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                color: "white",
              }}
            >
              Mint Starter Pack
            </Fab>
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Link
              href={"https://opensea.io/collection/teamdiff"}
              sx={{ textDecoration: "none" }}
              target={"_blank"}
            >
              <Fab
                variant="extended"
                size="large"
                color={"info"}
                aria-label="add"
                sx={{
                  fontSize: 20,
                  color: "white",
                }}
              >
                <Image
                  src={OpenSea}
                  alt={"opensea"}
                  width="30rem"
                  height="30rem"
                />
                <Box sx={{ marginLeft: 1 }}>Buy on OpenSea</Box>
              </Fab>
            </Link>
          </Box>
        </Card>
      </Box>
    );
  } else if (isConnected && !loadingError) {
    return <LoadingPrompt loading={"Your Collection"} />;
  } else if (loadingError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Card
          sx={{
            textAlign: "center",
            padding: 3,
            color: "white",
            width: "30rem",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Uh oh, there's been an error...
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.1rem",
              marginTop: ".4rem",
              marginBottom: ".4rem",
              overflowWrap: "break-word",
            }}
          >
            We encountered an unexpected error while loading your collection. Please check back again later. Don't worry, 
            your collection is still safe and sound on the blockchain. We're working hard to let you get back into the arena!
          </Typography>
        </Card>
      </Box>
    )
  }

  return <ConnectWalletPrompt accessing={"your collection"} />;
}
