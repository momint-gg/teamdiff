
import { Box,
            Fab, 
         Typography,
         Button} from "@mui/material";

//Router
import { useRouter } from 'next/router';



export default function CreateLeagueLanding() {
    // Router
    const router = useRouter();

    return(
    <Box sx={{ backgroundColor: "primary.dark" }}>
      
        <Typography variant="h3" color="secondary" component="div">
            Create a League
        </Typography>
        {/* <hr
            style={{
            color: "secondary",
            backgroundColor: "secondary",
            height: 2,
            }}
        />  */}
        <br></br>
        <Box
            sx={{
                // margin: "3vh, 0, 3vh, 0"
                display: "flex",
                flexDirection: "column",
                // alignItems: "flex-end"
            }}  
        >
            <Typography align="left" variant="h6" color="white" component="div">
                By pressing "I Understand"... I assert that I'm a crypto and gaming fan... Insert more info about league creation here...
            </Typography>
            <br></br>
            <Fab  
                onClick={() =>  router.push("/createLeague")}
                variant="extended"
                sx={{
                    background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    marginLeft: "auto"
                }}
            >
                I Understand
            </Fab>
        </Box>
    </Box>
    
    )
}