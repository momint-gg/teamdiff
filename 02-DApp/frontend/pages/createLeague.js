
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Box, CircularProgress, Typography, Button, Chip, Container, Paper, Fab, OutlinedInput, styled, outlinedInputClasses, Checkbox, FormControlLabel } from "@mui/material";
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

import { ethers } from "ethers";

//Wagmi imports
import {
  useAccount,
} from "wagmi";

//Router
import { useRouter } from 'next/router';

//Contract imports
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddresses.js";
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/abis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json";
import RinkebyUSDCJSON from "../../backend/contractscripts/contract_info/abis/RinkebyUSDCJSON.json";


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
    buyInCost: "",
    payoutSplit: "default",
    whitelistedAddresses: [],
    inviteListStatus: "open"
  };

  //WAGMI Hooks
  const { data: accountData, isLoading, error } = useAccount({ ens: true })

  //TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );

  
  // Router
  const router = useRouter();

  //Contract State Hooks
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [hasCreatedLeague, setHasCreatedLeague] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState(null);
  const [newLeagueAddress, setNewLeagueAddress] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues)

  // const [inviteListIsEnabled, setInviteListIsEnabled] = useState(false)
  //Rendering stat hooks
  const [inviteListValues, setInviteListValues] = useState([])
  const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true)
  const [validAddressesStatus, setValidAddressesStatus] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const[isValidBuyInCost, setIsValidBuyInCost] = useState(true)
  const[isValidLeagueName, setIsValidLeagueName] = useState(true)

  useEffect(() => {
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      setLeagueMakerContract(LeagueMakerContract);
      //TODO filter
      //TODO add manual filter to event
      // const filter = {
      //   address: LeagueMakerContract.address,
      //   topics: [
      //     utils.id("leagueCreated(string,address,address)"),
      //     //The below lines indicate what the returned event values should be filtered to
      //     formValues.leagueName,
      //     null,
      //     hexZeroPad(accountData.address, 32),
      //     //TODO add a signer field to leagueCreated Event
      //     // hexZeroPad(signerAddress, 32)
      //   ],
      // };
      // const filter = LeagueMakerContract.filters.LeagueCreated(null, null, accountData?.address, null)

      // LeagueMakerContract.on(filter, leagueCreatedCallback);

      LeagueMakerContract.once("LeagueCreated", leagueCreatedCallback);

  }, [])

  useEffect(() => {
    if(accountData) {
      console.log("connected to acocunt : " + accountData.address);
      // const filter = leagueMakerContract.filters.LeagueCreated(null, null, accountData?.address, null)
      // leagueMakerContract.on(filter, leagueCreatedCallback);
    }
    else {
      console.log("no account data :'(");
    }
  }, [accountData?.address])

  // Callback for when league created event is fired from league maker contract
  const leagueCreatedCallback = async (newLeagueName, newLeagueProxyAddress, newLeagueAdminAddress, initialWhitelistAddresses) => {

    //Get Provider of session, and create wallet signer object from provider (to sign transactions as user)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    //Construct LeagueProxyContract with signer
    const LeagueProxyContractWithSigner = new ethers.Contract(
      newLeagueProxyAddress,
      LeagueOfLegendsLogicJSON.abi,
      signer
    );

    const RinkebyUSDCContract = new ethers.Contract(
      "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
      RinkebyUSDCJSON,
      signer
    );


    //Check is admin of the newly created league is the currently logged in account
      //If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if (currentAddress == newLeagueAdminAddress) {

      //Request that user approves their new league to withdraw USDC on behalf of their wallet
        //Required for staking
      const stakeAmount = await LeagueProxyContractWithSigner.stakeAmount();
      //TODO: set correct stakeamount
      const approvalTxn = await RinkebyUSDCContract
      .approve(newLeagueProxyAddress, stakeAmount * 10000000)
      .catch((error) => {
        //  console.log("Join League error: " + error.error.message);
         alert("Approve USDC error: " + error.message);
         setIsCreatingLeague(false);

       });
      

       //Send request to user to join the league 
       const joinNewlyCreatedLeagueTxn = await LeagueProxyContractWithSigner
       .joinLeague({
         gasLimit: 1000000
       })
       .then(
         console.log("joining newly created league...")
       )
       .catch((error) => {
        //  console.log("Join League error: " + error.error.message);
         alert("Join League error: " + error.message);
         setIsCreatingLeague(false);

       });


       //For each address on the initial whitelist, send transaction to add address to whitelist of new league
      initialWhitelistAddresses.forEach(async (whitelistAddress) => {
        const addUsersToWhitelistTxn = await LeagueProxyContractWithSigner
        .addUserToWhitelist(whitelistAddress, {
          gasLimit: 10000000
        })
        .then(
          // console.log("Added userr to whitelist success")
        )
        .catch((error) => {
          //console.log("")
          alert("Add User To WhiteList error: " + error.message);
          setIsCreatingLeague(false);

        });
      })

     
      //Update state hooks
      setIsCreatingLeague(false);
      setHasCreatedLeague(true);
      setNewLeagueName(newLeagueName);
      setNewLeagueAddress(newLeagueProxyAddress);
      // console.log("Finsihed creating league: " 
      //             + "\n\tname: " + newLeagueName
      //             + "\n\tproxy address: " + newLeagueProxyAddress
      //             + "\n\tadmin address: " + newLeagueAdminAddress);
      //             // + "\n\tstate of invite list: " + inviteListValues);

    }
  
  };

  //Hanlder for form submit
  const createLeagueSubmitHandler = async () => {
    //Get Provider of session, and create wallet signer object from provider (to sign transactions as user)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    //Connect to leagueMaker with connect wallet
    const leagueMakerContractWithSigner = leagueMakerContract.connect(signer);

    //Send createLeague transaction to LeagueMaker
    const createLeagueTxn = await leagueMakerContractWithSigner
      .createLeague(
          formValues.leagueName,
          formValues.buyInCost,
          (formValues.inviteListStatus === "open"),
          accountData.address,
          CONTRACT_ADDRESSES.TestUSDC,
          CONTRACT_ADDRESSES.Athletes,
          CONTRACT_ADDRESSES.GameItems,
          inviteListValues,
        {
        gasLimit: 10000000,
      })
      .then((res) => {
        //console.log("txn result: " + JSON.stringify(res, null, 2));
        setIsCreatingLeague(true);
        console.log("League Creation in progress...");
        //console.log("With invite values: " + inviteListValues);
        //how to tell if transaction failed?
        //TODO print message to alert if it takes mroe than 60 seconds
      })
      .catch((error) => {
        alert("Create League error: " + error.error.message);
      });
  }
  

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // console.log(name)
    setFormValues({
      ...formValues,
      [name]: value,
    })
    // console.log(formValues)
  };

  useEffect(() => {
    if (formValues.leagueName.length > 100) {
      setIsValidLeagueName(false)
    } else if (!isValidLeagueName) {
      setIsValidLeagueName(true)
    }
  }, [formValues.leagueName])

  useEffect(() => {
    if (formValues.buyInCost === "" ) {
      setIsValidBuyInCost(true)
    } else if (isNaN(formValues.buyInCost) || Number(formValues.buyInCost) <= 0 || Number(formValues.buyInCost) > 100) {
      // console.log("uhoh")
      // console.log(typeof formValues.buyInCost, formValues.buyInCost)
      setIsValidBuyInCost(false)
    } else if (!isValidBuyInCost) {
      setIsValidBuyInCost(true)
    }
    // console.log("--", parseInt(formValues.buyInCost))
  }, [formValues.buyInCost])


  useEffect(() => {
    let flag = true
    inviteListValues.forEach((e) => {
      if (WAValidator.validate(e, "ETH")) {
        // console.log("validated")
      } else {
        // console.log("invalid")
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
    //setInviteListValues([...inviteListValues], e);
    setInviteListValues(inviteListValuesNew)
    console.log("short list in func: " + inviteListValues);

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
{/* 
      {showForm && (
        <Typography variant="p" color="white" component="div">
          Insert more info about league creation here... Should persist after clicking I understand ... 
          Buy in cost must be less than 100 USD. League name must be between 1-100 characters. 
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
      )} */}

      {accountData && !(isCreatingLeague || hasCreatedLeague) && (
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
              <FormControl required>
                <StyledInputLabel htmlFor="league-name">League Name</StyledInputLabel>
                <StyledOutlinedInput
                  id="league-name"
                  value={formValues.leaguename}
                  onChange={handleInputChange}
                  label="League Name"
                  name="leagueName"
                  error={!isValidLeagueName}
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
              <FormControl required >
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

              <FormControl required>
                <StyledInputLabel htmlFor="buy-in">Buy-In Cost</StyledInputLabel>
                <StyledOutlinedInput
                  id="buy-in"
                  value={formValues.leaguename}
                  onChange={handleInputChange}
                  label="Buy-In Cost"
                  name="buyInCost"
                  endAdornment={<InputAdornment position="end">USDC</InputAdornment>}
                  error={!isValidBuyInCost}
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

              <FormControl required sx={{ marginLeft: 3 }}>
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

              <FormControl required sx={{ marginLeft: 3 }}>
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
              
              <StyledButton onClick={()=>{createLeagueSubmitHandler()}} variant="contained" size="small">Submit</StyledButton>
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

              {/* TODO: Abstract this into another component, controlled by createLeague page */}
              {!(formValues.inviteListStatus === "closed") ? (
                <Typography variant="h7" color="lightgrey">
                    Anybody with a wallet address can search and join this league.
                </Typography>
                ) : (
                <>
                <Typography variant="h7" color="lightgrey">
                  Only users added to this leagues whitelist can join.
                </Typography>
                <Typography variant="h6" color="white" component="div">
                  Invite list:
                </Typography>
                

              {/* TODO: Abstract this into another component, controlled by createLeague page */}
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
                      label={"Whitelisted Address " + (index + 1)} 
                      onChange={e => {
                        //This submits null address when I copy and paste
                        handlePlayerInviteInput(e, index)
                        console.log("short list outside func: " + inviteListValues);
                      }}
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
                    Add Another Address to Whitelist
                  </Button>


                </>
                
                )}
            </Box>
            
          </Grid>
        </Grid>
      )}
      {isCreatingLeague && (
        <Container>
          <Typography>Your League is being created...</Typography>
          <CircularProgress />
        </Container>
      )}
      {hasCreatedLeague && (
        <Box>
          <Typography>
            {"Your Team Diff League \"" + newLeagueName + "\" has been created!"}
          </Typography>
          <br></br>
          <a
            href={
              "https://rinkeby.etherscan.io/address/"
              + newLeagueAddress
              + "#internaltx"
            }
            target={"_blank"}
            rel="noreferrer"
          >
            View League on Etherscan
          </a>
          <br></br>
          <a
            href={
              "http://localhost:3000/leagues/"
              + newLeagueAddress
            }
            target={"_blank"}
            rel="noreferrer"
          >
            View League on TeamDiff
          </a>
          <br></br>
          <Button
            onClick={() => {
              router.reload(window.location.pathname);
            }}
          >
            Create Another League
          </Button>
        </Box>
      )}
      {!accountData && !hasCreatedLeague && !isCreatingLeague && (
        <div> Please connect your wallet to create a league </div>
      )}
      
    </Box>
  )
}
