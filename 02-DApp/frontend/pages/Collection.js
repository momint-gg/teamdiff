import { useState, useEffect } from "react";
import { useAccount } from 'wagmi'
import AthleteCard from "../components/AthleteCard";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Grid } from "@mui/material";
import constants from "../Constants";
import AthleteCardModal from "../components/AthleteCardModal";

export default function Collection() {
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
      })
    const [nftResp, setNFTResp] = useState(null);
    const [packNFTs, setPackNFTs] = useState([]);
    const [athleteNFTs, setAthleteNFTs] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [currAthlete, setCurrAthlete] = useState(null);
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

    useEffect(() => {
        // declare the async data fetching function
        const getNFTData = async () => {
            const web3 = createAlchemyWeb3(
                constants.ALCHEMY_LINK,
            );

            const nfts = await web3.alchemy.getNfts({owner: accountData.address,
                                                    contractAddresses: [constants.CONTRACT_ADDR]});
          
            setNFTResp(nfts);
            for (const nft of nfts?.ownedNfts) {
                let token = nft?.id?.tokenId;
                const response = await web3.alchemy.getNftMetadata({
                    contractAddress: constants.CONTRACT_ADDR,
                    tokenId: token
                })
                if (response.title?.includes("Pack")) {
                    setPackNFTs(packNFTs => [...packNFTs, response]);
                } else {
                    setAthleteNFTs(athleteNFTs => [...athleteNFTs, response]);
                }
                
            }
        }
      
        if (accountData) {
          getNFTData()
           .catch(console.error);
        }
        
    }, [])

    if (accountData && nftResp) {
        return (
            <Box backgroundColor='primary.dark'>
            <Typography variant="h2" color="secondary" component="div">
               PACKS
            </Typography>
            <hr
                style={{
                    color: "white",
                    backgroundColor: "white",
                    height: 5,
                }}
            />
            <Grid container spacing={3}>
                    {packNFTs?.map(athleteData => (
                        <Grid item xs={4}>
                            <AthleteCard athleteData={athleteData} setAthlete={setCurrAthlete} setModalOpen={setModalOpen} />
                        </Grid>
                    ))}
            </Grid>
            <Typography variant="h2" color="secondary" component="div" style={{marginTop: 10}}>
                PLAYERS
            </Typography>
            <hr
                style={{
                    color: "white",
                    backgroundColor: "white",
                    height: 5
                }}
            />
                <Grid container spacing={3}>
                    {athleteNFTs?.map(athleteData => (
                        <Grid item xs={4}>
                            <AthleteCard athleteData={athleteData} setAthlete={setCurrAthlete} setModalOpen={setModalOpen}/>
                        </Grid>
                    ))}
                </Grid>
            <AthleteCardModal modalOpen={modalOpen} athleteData={currAthlete} handleModalClose={handleModalClose} />
            </Box>
        );
    } else if (accountData) {
        return (
            <Box backgroundColor='primary.dark'>
                <Typography variant="h2" color="secondary" component="div">
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <Box backgroundColor='primary.dark'>
            <Typography variant="h2" color="secondary" component="div">
                Please connect your wallet to get started.
            </Typography>
        </Box>
    );
}