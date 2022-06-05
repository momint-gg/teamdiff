import "bootstrap/dist/css/bootstrap.css";
import {
  Container,
  Box,
  Grid,
  Fab,
  Typography,
  ImageList,
  ImageListItem,
  Button,
} from "@mui/material";

export default function StarterPackContents() {
  // If we want to try to load from pinata
  // const requireContext = require.context('../../backend/pinata/final_metadata', false, /\.json$/);
  // const starterPackAthleteData = [];
  // requireContext.keys().forEach((key) => {
  //   const obj = requireContext(key);
  //   starterPackAthleteData.push(obj);
  // });
  // console.log(starterPackAthleteData)
  const isMobile = false;
  // Loading from public folder
  const requireContext = require.context('../assets/cards/', false, /png$/);
  const reqArr = []
  requireContext.keys().forEach((key) => {
    reqArr.push(key);
  });

  if (reqArr.length >0) {
    return (
      <Box>
        {/* <Button
          variant="text"
          sx={{
            backgroundColor:"transparent",
            color:"white",
            borderRadius: "50%",
            fontSize: 18
          }
          }
          onClick={() => setDisplay(false)}
        >
          ‹ GO BACK
        </Button> */}
        <Box>
        <Typography variant="h3" color="white" marginBottom={2} >
          Starter Pack Contents
        </Typography>
          <ImageList 
            sx={{ width: "100%", 
                  height: "75vh", 
                  borderColor: "white", 
                  color:"white",
                  borderRadius:2,
                  border:1 }} 
            cols={isMobile? 3 : 5}>
            {/* If we want to try to load from pinata */}
            {/* {starterPackAthleteData.map((athleteData) => (
              <ImageListItem key={athleteData.image}>
                <img
                  src={`${athleteData.image}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${athleteData.image}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  alt={athleteData.title}
                  loading="eager"
                />
              </ImageListItem>
            ))} */}

            {/* Loading from public folder */}
            {reqArr.map((imgs) => (
              <ImageListItem sx={{margin:"5%"}}>
                <img
                  src={'/cards/'+imgs+'?w=164&h=164&fit=crop&auto=format'}
                  srcSet={'/cards/'+imgs+'?w=164&h=164&fit=crop&auto=format&dpr=2 2x'}
                  alt={"image"}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
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
