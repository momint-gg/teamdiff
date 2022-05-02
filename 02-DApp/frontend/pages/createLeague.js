import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Box, Typography, Button, Chip, Container, Paper, Fab, OutlinedInput, styled, outlinedInputClasses, Checkbox, FormControlLabel } from "@mui/material";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@material-ui/core/Grid'
// import wallet_address_validator from 'wallet-address-validator';
// https://www.npmjs.com/package/wallet-address-validator
import WAValidator from 'wallet-address-validator'; 

// const StyledOutlinedInput = styled(OutlinedInput)({
//   [`&$focused .${outlinedInputClasses.input}`]: {
//     borderColor: "green"
//   },
//   [`&:hover .${OutlinedInput.input}`]: {
//     color: "red"
//   },
// })

// https://codesandbox.io/s/outlinedinput-border-color-29715?fontsize=14&hidenavigation=1&theme=dark&file=/demo.js:747-767
// https://codesandbox.io/s/textfield-outlined-forked-0o0bdi?file=/src/index.js
const StyledOutlinedInput = styled(OutlinedInput)`
  &.MuiOutlinedInput-root.Mui-focused {
    color: white;
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: white;
  }
`

const StyledInputLabel = styled(InputLabel)`
  &.Mui-focused {
    color: white;
  } 
`

const StyledSelect = styled(Select)`
  &.Mui-focused {
    color: white;
  } 
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: white;
  }
`

const StyledButton = styled(Button)`
  color: white;
  background-color: ${props => props.theme.palette.primary.light};
  &:hover {
    filter: brightness(85%);
    background-color: ${props => props.theme.palette.primary.light};
    // color: white;
  }
`

export default function CreateLeague({ setDisplay }) {
  const defaultValues = {
    leagueName: "",
    token: "usdc",
    buyInCost: 0,
    payoutSplit: "default",
    whitelistedAddresses: [],
    inviteListStatus: "open"
  };

  const [formValues, setFormValues] = useState(defaultValues)

  // const [inviteListStatus, setInviteListStatus] = useState(false)

  const [inviteListValues, setInviteListValues] = useState(["trey's private key"])
  // TODO: automatically set the first value to be user that's logged in

  const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true)

  const [validAddressesStatus, setValidAddressesStatus] = useState(true)

  const [showForm, setShowForm] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name)
    setFormValues({
      ...formValues,
      [name]: value,
    });
    // console.log(formValues)
  };

  // const handleInviteListChange = (e) => {
  //   if (e.target.value === )
  //   setInviteListStatus(!inviteListStatus)
  // }

  useEffect(() => {
    let flag = true
    inviteListValues.forEach((e) => {
      if (WAValidator.validate(e, "ETH")) {
        console.log("validated")
      } else {
        console.log("invalid")
        flag = false
        setValidAddressesStatus(false)
      }
    })
    if (flag) {
      setValidAddressesStatus(true) 
    }
  }, [inviteListValues])

  const handlePlayerInviteInput = (e, i) => {
    let inviteListValuesNew = [...inviteListValues]
    inviteListValuesNew[i] = e.target.value
    setInviteListValues(inviteListValuesNew)
  }

  const addNewPlayerInviteInput = () => {
    if (addPlayerBtnEnabled && inviteListValues.length >= 7) {
      setAddPlayerBtnEnabled(false)
    }
    setInviteListValues(prevState => ([...prevState, ""])) 
  }

  const removePlayer = (i) => {
    let inviteListValuesNew = [...inviteListValues]
    inviteListValuesNew.splice(i, 1)
    setInviteListValues(inviteListValuesNew)
    if (!addPlayerBtnEnabled && inviteListValuesNew.length < 8) {
      setAddPlayerBtnEnabled(true)
    }
  }

  function handleShowForm() {
    setShowForm(true)
  }

  return (
    <Box sx={{ backgroundColor: "primary.dark" }}>
     {/* <Box sx={{ backgroundColor: "gray" }}> */}
      <Fab variant="extended" size="small" color="primary" aria-label="add" onClick={() => setDisplay(false)}>
        &#60; BACK
      </Fab>

      <Typography variant="h3" color="secondary" component="div">
        CREATE A LEAGUE
      </Typography>
      {/* <hr
        style={{
          color: "secondary",
          backgroundColor: "secondary",
          height: 5,
        }}
      /> */}
      {/* <Typography variant="h6" color="white" component="div">
        Fill out this form to create a league for you and your friends!
      </Typography> */}

      {showForm && (
        <Typography variant="p" color="white" component="div">
          Insert more info about league creation here... Should persist after clicking I understand
        </Typography>
      )}
      {!showForm && (
        <>
          <Typography variant="p" color="white" component="div">
            By pressing "I Understand"... I assert that I'm a crypto and gaming fan... Insert more info about league creation here...
          </Typography>
          <Button
            variant="outlined"
            onClick={handleShowForm}
            size="small"
          >
            I Understand!
          </Button> 
        </>
      )}

      {showForm && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box
              component="div"
              sx={{
                '& > :not(style)': { m: 1, width: '50ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <Typography variant="h6" color="white" component="div">
                Form
              </Typography>
              <FormControl>
                <StyledInputLabel htmlFor="league-name">League Name</StyledInputLabel>
                <StyledOutlinedInput
                  id="league-name"
                  value={formValues.leaguename}
                  onChange={handleInputChange}
                  label="League Name"
                  name="leagueName"
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
              <FormControl >
                <StyledInputLabel htmlFor="token-select">Token</StyledInputLabel>
                <StyledSelect
                  id="token-select"
                  value={formValues.token}
                  label="token"
                  name="token"
                  onChange={handleInputChange}
                >
                  <MenuItem key="usdc" value="usdc">USDC</MenuItem>
                  {/* <MenuItem key="eth" value="eth">eth</MenuItem>
                  <MenuItem key="other" value="other">other</MenuItem> */}
                </StyledSelect>
              </FormControl>

              <FormControl>
                <StyledInputLabel htmlFor="buy-in">Buy-In Cost</StyledInputLabel>
                <StyledOutlinedInput
                  id="buy-in"
                  value={formValues.leaguename}
                  onChange={handleInputChange}
                  label="Buy-In Cost"
                  name="buyInCost"
                  endAdornment={<InputAdornment position="end">USDC</InputAdornment>}

                >

                </StyledOutlinedInput>
                {/* <Input
                    id="standard-adornment-amount"
                    value={formValues.buyInCost}
                    onChange={handleInputChange}
                    name="buyInCost"
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  /> */}
              </FormControl>

              <FormControl sx={{ marginLeft: 3 }}>
                <StyledInputLabel id="demo-simple-select-label">Payout Split</StyledInputLabel>
                <StyledSelect
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formValues.payoutSplit}
                  label="payoutSplit"
                  name="payoutSplit"
                  onChange={handleInputChange}
                >
                  <MenuItem key="default" value="default">default</MenuItem>
                </StyledSelect>
              </FormControl>

              <FormControl sx={{ marginLeft: 3 }}>
                <StyledInputLabel id="open-closed-toggle">League Status</StyledInputLabel>
                <StyledSelect
                  labelId="open-closed-toggle"
                  id="open-closed-toggle-select"
                  value={formValues.inviteListStatus}
                  label="inviteListStatus"
                  name="inviteListStatus"
                  onChange={handleInputChange}
                >
                  <MenuItem key="open" value="open">open</MenuItem>
                  <MenuItem key="closed" value="closed">closed</MenuItem>
                </StyledSelect>
              </FormControl>
              
              <StyledButton variant="contained" size="small">Submit</StyledButton>
              {/* <Button variant="contained" size="small" sx={{backgroundColor: "primary.light"}}>Submit</Button> */}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
                component="div"
                sx={{
                  '& > :not(style)': { m: 1, width: '50ch' },
                  color: "white",
                }}
                noValidate
                autoComplete="off"
              >
              {/* <Typography variant="h6" color="white" component="div">
                Invite List (optional)
              </Typography> */}
              {/* <FormControlLabel 
                label="Enable Invite List"
                control={
                <Checkbox 
                  checked={inviteListStatus}
                  onChange={handleInviteListCheckbox}
                />}
              /> */}
              {/* TODO: Abstract this into another component, controlled by createLeague page */}
              {formValues.inviteListStatus === "closed" && (
                <>
                <Typography variant="h6" color="white" component="div">
                  Invite List (Private/Closed Leagues)
                </Typography>
                {!validAddressesStatus && ( 
                  <p>
                    There are invalid addresses.
                  </p> 
                )}
                {/* https://bapunawarsaddam.medium.com/add-and-remove-form-fields-dynamically-using-react-and-react-hooks-3b033c3c0bf5 */}
                  {inviteListValues.map((element, index) => (
                    <>
                    <TextField
                      variant="standard"
                      label={"Player " + (index + 1) + (index === 0 ? " (League Admin)" : "")} 
                      onChange={e => handlePlayerInviteInput(e, index)}
                      value={element}
                      key={index}
                    />
                    {index ? 
                      <Button 
                        variant="outlined"
                        onClick={() => removePlayer(index)}
                        size="small"
                      >
                        Remove
                      </Button>
                      : null
                    }
                    </>
                  ))}
                  <Button 
                    variant="outlined"
                    onClick={addNewPlayerInviteInput}
                    size="small"
                    disabled={!addPlayerBtnEnabled}
                  >
                    Add Another Player
                  </Button>


                </>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
