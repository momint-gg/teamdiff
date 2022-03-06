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
    const [nftData, setNFTData] = useState([]);
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
                setNFTData(nftData => [...nftData, response]);
            }
        }
      
        if (accountData) {
          getNFTData()
           .catch(console.error);
        }
        
    }, [])

    if (accountData && nftResp && nftData.length>0) {
        console.log(nftData);
        return (
            <Box>
            <Typography variant="h2" color="secondary" component="div">
                Your collection
            </Typography>
                <Grid container spacing={3}>
                    {nftData?.map(athleteData => (
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