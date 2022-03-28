import { useState, useEffect } from "react";
import { useAccount } from 'wagmi'
import AthleteCard from "../components/AthleteCard";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Box, Typography, Grid } from "@mui/material";
import constants from "../Constants";
import ConnectWallet from "./ConnectWallet";

export default function Collection() {
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
      })
    const [nftResp, setNFTResp] = useState(null);
    const [packNFTs, setPackNFTs] = useState([]);
    const [athleteNFTs, setAthleteNFTs] = useState([]);
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
            <Box>
            <Typography variant="h2" color="secondary" component="div">
               PACKS
            </Typography>
            <hr
                style={{
                    color: "secondary",
                    backgroundColor: "secondary",
                    height: 5
                }}
            />
            <Grid container spacing={3}>
                    {packNFTs?.map(athleteData => (
                        <Grid item xs={4}>
                            <AthleteCard athleteData={athleteData} />
                        </Grid>
                    ))}
                </Grid>
            <Typography variant="h2" color="secondary" component="div">
                PLAYERS
            </Typography>
            <hr
                style={{
                    color: "secondary",
                    backgroundColor: "secondary",
                    height: 5
                }}
            />
                <Grid container spacing={3}>
                    {athleteNFTs?.map(athleteData => (
                        <Grid item xs={4}>
                            <AthleteCard athleteData={athleteData} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    } else if (accountData) {
        return (
            <Box>
                <Typography variant="h2" color="secondary" component="div">
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h2" color="secondary" component="div">
                Please connect your wallet to get started.
            </Typography>
            {/* <ConnectWallet></ConnectWallet> */}
        </Box>
    );
}