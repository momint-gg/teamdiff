import 'bootstrap/dist/css/bootstrap.css';
import { Container, Box, Typography, ImageList, ImageListItem } from "@mui/material";
import Image from 'next/image';
import profilePic from '../assets/images/example.png';
import { useState, useEffect } from "react";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import constants from "../Constants";
import { useAccount } from 'wagmi';



export default function StarterPackContents() {
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
      })
    const [nftResp, setNFTResp] = useState(null);
    const [nftData, setNFTData] = useState([]);

    //TODO how do we show collection of unminted nfts?
    //Look at contract data to see how much of what has been minted, and calculate probabilities that way too
    useEffect(() => {
        // declare the async data fetching function
        const getNFTData = async () => {
            const web3 = createAlchemyWeb3(
                constants.ALCHEMY_LINK,
            );

            const nfts = await web3.alchemy.getNfts({owner: "0x94b90ca07014f8b67a6bca8b1b7313d5fd8d2160",
                                                    contractAddresses: [constants.CONTRACT_ADDR]});
          
            setNFTResp(nfts);
            for (const nft of nfts?.ownedNfts) {
                let token = nft?.id?.tokenId;
                const response = await web3.alchemy.getNftMetadata({
                    contractAddress: "0x94b90ca07014f8b67a6bca8b1b7313d5fd8d2160",
                    tokenId: token
                })
                setNFTData(nftData => [...nftData, response]);
                console
            }
        }
      
        // if (accountData) {
        //   getNFTData()
        //    .catch(console.error);
        // }
        
    }, [])

    if (nftData.length>0) {
        return(
        <Box
        /*this should be in constants style sheet as the wrapper box for all pages*/
        sx={{
            backgroundColor: 'primary.dark',
            display: 'flex',
            flexDirection: 'row'
          }}
        >
           <Container>
           <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                {nftData?.map((item) => (
                    console.log(JSON.stringify(item, 2, null)),
                    // <ImageListItem key={item.img}>
                    // <img
                    //     // src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                    //     // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    //     // alt={item.title}
                    //      src={profilePic}
                    //     //srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    //     alt="alt"
                    //     loading="lazy"
                    // />
                    // </ImageListItem>
                ))}
            </ImageList>
           </Container>
        </Box>

    );
    }
    return (
        <Box>
            <Typography variant="h2" color="secondary" component="div">
                Please wait while we load colleciton
            </Typography>
        </Box>
    );
}