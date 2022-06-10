import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FormControl, MenuItem, TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import AthleteCard from "../components/AthleteCard";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Grid, Select } from "@mui/material";
import constants from "../constants";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import ImageListItem from '@mui/material/ImageListItem';
import ImageList from '@mui/material/ImageList';

import ConnectWallet from "./connectWallet";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";
import LoadingPrompt from "../components/LoadingPrompt";
import AthleteCardModal from "../components/AthleteCardModal";
import { useMediaQuery } from "react-responsive";

export default function Collection() {
  const [nftResp, setNFTResp] = useState(null);
  const [packNFTs, setPackNFTs] = useState([]);
  const [athleteNFTs, setAthleteNFTs] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currAthlete, setCurrAthlete] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSeachQuery] = useState("")
  const [isPreparingAthletes, setIsPreparingAthletes] = useState(true)
  const [allTeamFilterOptions, setAllTeamFilterOptions] = useState([])
  const [teamFilterSelection, setTeamFilterSelection] = useState('')
  const [teamPositionSelection, setTeamPositionSelection] = useState('')
  const [athleteNFTsWrapper, setAthleteNFTsWrapper] = useState([])


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

      if (accounts.length > 0) {
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
    provider.provider.on('disconnect', () => {
      console.log("disconnected");
      setIsConnected(false)
    })
  }, []);

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleClick = () => {
    setMenu((menu) => !menu);
  };
  const handleClickAway = () => {
    setMenu(false);
  };

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  useEffect(async () => {
    setPackNFTs([]);
    setAthleteNFTs([]);
    setAthleteNFTsWrapper([]);
    // declare the async data fetching function
    if (isConnected) {
      const getNFTData = async () => {
        const web3 = createAlchemyWeb3(constants.ALCHEMY_LINK);

        const nfts = await web3.alchemy.getNfts({
          owner: connectedAccount,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        });

        setNFTResp(nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: CONTRACT_ADDRESSES.GameItems,
            tokenId: token,
          });
          // console.log("Token #" + token + " metadata: " + JSON.stringify(response, null, 2));
          if (response.title?.includes("Pack")) {
            setPackNFTs((packNFTs) => [...packNFTs, response]);
          } else {
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
            setAthleteNFTsWrapper((athleteNFTsWrapper) => [...athleteNFTsWrapper, response]);
          }
        }
      };

      await getNFTData().catch((error) => {
        console.log("fetch NFT DATA error: " + JSON.stringify(error, null, 2));
      });
      console.log('done with preparing atheletes')
      // console.log(athleteNFTs, 'hmm')
      // setAthleteNFTsWrapper(athleteNFTs)
      setIsPreparingAthletes(false)
    }
  }, [isConnected, connectedAccount]);

  // const returnSearchResults = () => {
  //   return athleteNFTs.filter((athlete) => athlete.metadata.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
  // }


  const filterResults = (inputs) => {
    let athleteNFTsCopy = [...athleteNFTs]
    if (inputs.team) {
      athleteNFTsCopy = athleteNFTsCopy.filter((athlete) => {
        const attributesRaw = athlete.metadata.attributes
        for (const a of attributesRaw) {
          if (a["trait_type"].toLowerCase() === "team" && a["value"] === inputs.team) {
            return true
          }
        }
        return false
      })
    } 
    if (inputs.position) {
      athleteNFTsCopy = athleteNFTsCopy.filter((athlete) => {
        const attributesRaw = athlete.metadata.attributes
        for (const a of attributesRaw) {
          if (a["trait_type"].toLowerCase() === "position" && a["value"] === inputs.position) {
            return true
          }
        }
        return false
      })
    }
    if (inputs.query) {
      athleteNFTsCopy = athleteNFTsCopy.filter((athlete) => athlete.metadata.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
    }

    return athleteNFTsCopy
  }

  const getTeamFilterOptions = () => {
    const arr = []
    for (const athlete of athleteNFTs) {
      const attributesRaw = athlete.metadata.attributes
      console.log(attributesRaw, "***")
      for (const a of attributesRaw) {
        if (a["trait_type"].toLowerCase() === "team") {
          arr.push(a["value"])
        }
      }
    }
    // const allTeams = athleteNFTs.map((athlete) => athlete.metadata.team) 
    console.log(arr, 'lll')
    return [... new Set(arr)]
  }

  useEffect(() => {
    if (!isPreparingAthletes) {
      setAllTeamFilterOptions(getTeamFilterOptions())
      console.log('useeffect')
      setTimeout(() => {
        console.log(allTeamFilterOptions)
      }, 1000)
    }
  }, [isPreparingAthletes])
  // const allTeamFilterOptions = getTeamFilterOptions()

  // const ALL_POSITION_FILTER_OPTIONS = {
  //   top: 'Top',
  //   adc: 'ADC',
  //   mid: 'Mid',
  //   jungle: 'Jungle',
  //   support: 'Support'
  // }

  const ALL_POSITION_FILTER_OPTIONS = [
    'Top',
    'ADC',
    'Mid',
    'Jungle',
    'Support'
  ]

  // handles any change in filter/query
  useEffect(() => {
    const filteredResults = filterResults({
      team: teamFilterSelection,
      query: searchQuery,
      position: teamPositionSelection
    })
    console.log(filteredResults, 'filtered')
    setAthleteNFTsWrapper(filteredResults)
  }, [teamFilterSelection, searchQuery, teamPositionSelection])

  const handleTeamFilterChange = (e) => {
    const { name, value } = e.target
    setTeamFilterSelection(value)
  }

  const handlePositionFilterChange = (e) => {
    setTeamPositionSelection(e.target.value)
  }

  const handleQueryChange = (e) => {
    setSeachQuery(e.target.value)
  }

  if (isConnected && nftResp && allTeamFilterOptions.length !== 0) {
    return (
      // https://mui.com/material-ui/react-select/
      <>

        <Box>

          <Typography
            variant={isMobile ? "h4" : "h2"}
            color="secondary"
            component="div"
            style={{ marginTop: 10 }}
          >
            Owned Athletes
          </Typography>
          <hr
            style={{
              color: "white",
              backgroundColor: "white",
              height: 5,
            }} />
          <Box
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

          </Box>
          <Typography
            variant={isMobile ? "h8" : "h6"}
            color="secondary.light"
            component="div"
            sx={{ 
              marginBottom: "20px"
             }}
          >
            Showing {athleteNFTsWrapper.length} out of {athleteNFTs.length} total athletes.
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
              <ImageListItem sx={{ margin: "5%" }}>
              <img
                src={"/cards/"+athleteData?.title+".png?w=164&h=164&fit=crop&auto=format"}
                alt={"Athlete card"}
                loading="lazy"
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
            athleteData={currAthlete}
            handleModalClose={handleModalClose} />
          <Typography
            variant={isMobile ? "h4" : "h2"}
            color="secondary"
            component="div"
          >
            Owned Starter Packs
          </Typography>
          <hr
            style={{
              color: "white",
              backgroundColor: "white",
              height: 5,
            }} />
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
                  src={"/starterPack.png?w=164&h=164&fit=crop&auto=format"}
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
        </Box></>
    );
  } else if (isConnected) {
    return (
      <LoadingPrompt loading={"Your Collection"} />
    );
  }

  return (
    <ConnectWalletPrompt accessing={"your collection"} />
  );
}
