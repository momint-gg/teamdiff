import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Box, Typography, Button, Chip, Container, Paper, Fab, OutlinedInput, styled, outlinedInputClasses  } from "@mui/material";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@material-ui/core/Grid'

const StyledOutlinedInput = styled(OutlinedInput)({
  [`& .${outlinedInputClasses.focused} .${outlinedInputClasses.input}`]: {
    borderColor: "green"
  },
  [`&:hover .${outlinedInputClasses.input}`]: {
    color: "red"
  },
})

export default function CreateLeague({setDisplay}) {
    const defaultValues = {
        leagueName: "",
        token: "eth",
        buyInCost: 0,
        payoutSplit: "default",
        whitelistedAddresses: [],
      };

    const [formValues, setFormValues] = useState(defaultValues)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
          ...formValues,
          [name]: value,
        });
      };

    return (
        <Box sx={{backgroundColor: "primary.main"}}>
          <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplay(false)}>
            &#60; BACK
          </Fab>

        <Typography variant="h3" color="secondary" component="div">
               CREATE A LEAGUE
            </Typography>
            <hr
                style={{
                    color: "secondary",
                    backgroundColor: "secondary",
                    height: 5,
                }}
            />
        <Typography variant="h6" color="white" component="div">
               Fill out this form to create a league for you and your friends!
        </Typography>


        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box
              component="form"
              sx={{
                  '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
              >
                <FormControl>
                  <InputLabel htmlFor="component-outlined">Name</InputLabel>
                  <StyledOutlinedInput
                    id="component-outlined"
                    value={"we"}
                    onChange={handleInputChange}
                    label="Name"
                  />
                </FormControl>
              {/* <TextField
                required
                label="League Name"
                variant="standard"
                color="secondary"
                backgroundColor="secondary"
                id='outlined-required'
                // defaultValue="e.g. TeamDiff"
              /> */}
            </Box>
            <FormControl >
              <InputLabel id="demo-simple-select-label">Token</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={formValues.token}
                label="token"
                name="token"
                onChange={handleInputChange}
                >
                <MenuItem key="eth" value="eth">eth</MenuItem>
                <MenuItem key="usdc" value="usdc">usdc</MenuItem>
                <MenuItem key="other" value="other">other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          
          </Grid>
        </Grid>
        
        
        

        

        <FormControl  sx={{ marginLeft: 3 }} variant="standard">
          <InputLabel>Buy-In Cost</InputLabel>
          <Input
            id="standard-adornment-amount"
            value={formValues.buyInCost}
            onChange={handleInputChange}
            name="buyInCost"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>

        <FormControl sx={{ marginLeft: 3 }}>
            <InputLabel id="demo-simple-select-label">Payout Split</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formValues.payoutSplit}
            label="payoutSplit"
            name="payoutSplit"
            onChange={handleInputChange}
            >
            <MenuItem key="default" value="default">default</MenuItem>
            </Select>
        </FormControl>
        </Box>
    )
}