
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
    <Box >
      
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
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
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