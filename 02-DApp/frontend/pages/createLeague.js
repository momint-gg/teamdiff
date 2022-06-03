
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Box, Link, FormLabel, FormGroup, Switch, CircularProgress, Typography, Button, Chip, Container, Paper, Fab, OutlinedInput, styled, outlinedInputClasses, Checkbox, FormControlLabel } from "@mui/material";
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
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [hasJoinedLeague, setHasJoinedLeague] = useState(false);
  // const [inviteListIsEnabled, setInviteListIsEnabled] = useState(false)
  //Rendering stat hooks
  const [inviteListValues, setInviteListValues] = useState([])
  const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true)
  const [validAddressesStatus, setValidAddressesStatus] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const[isValidBuyInCost, setIsValidBuyInCost] = useState(true)
  const[isValidLeagueName, setIsValidLeagueName] = useState(true)
  const [isValidInviteList, setIsValidInviteList] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    // setIsCreatingLeague(false);
    // setHasCreatedLeague(true);
    // setHasJoinedLeague(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

      // const fetchData = async () => {
      //   const currentAddress = await signer.getAddress()
      //   setAddressPreview(currentAddress)
      // }
      // fetchData()
      const setAccountData = async () => {
        const signer = provider.getSigner()
        const accounts = await provider.listAccounts();

        if(accounts.length > 0) {
          const accountAddress = await signer.getAddress()
          setSigner(signer)
          setConnectedAccount(accountAddress)
          setIsConnected(true)
      
        }
        else {
          setIsConnected(false);
        }
      }
      setAccountData()
      provider.provider.on('accountsChanged', (accounts) => { setAccountData() })
      provider.provider.on('disconnect', () =>  { console.log("disconnected"); 
                                                  setIsConnected(false) })
    }, []);


    useEffect(() => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Initialize connections to GameItems contract
      const LeagueMakerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.LeagueMaker,
        LeagueMakerJSON.abi,
        provider
      );
      setLeagueMakerContract(LeagueMakerContract);
      //TODO filter
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


  //Callback for when a STaked event is fired from leagueProxy contract (occurs when user stakes USDC to joinLeague)
  const stakedEventCallback = async (stakerAddress, stakeAmount, leagueAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    //Check is admin of the newly created league is the currently logged in account
      //If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if(stakerAddress === currentAddress) {
      setIsJoiningLeague(false);
      setHasJoinedLeague(true);
      // router.reload(window.location.pathname);

      // setStakerAddress(stakerAddress)
    }
    else {
      console.log(stakerAddress + " != " + currentAddress);
    }
  }

  // Callback for when league created event is fired from league maker contract
  const leagueCreatedCallback = async (newLeagueName, newLeagueProxyAddress, newLeagueAdminAddress, initialWhitelistAddresses) => {

    //Get Provider of session, and create wallet signer object from provider (to sign transactions as user)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    //Check is admin of the newly created league is the currently logged in account
      //If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if (currentAddress == newLeagueAdminAddress) {
      //Update state hooks
      setIsCreatingLeague(false);
      setHasCreatedLeague(true);
      setNewLeagueName(newLeagueName);
      setNewLeagueAddress(newLeagueProxyAddress);
      setIsJoiningLeague(true);

      //Construct LeagueProxyContract with signer
      const LeagueProxyContractWithSigner = new ethers.Contract(
        newLeagueProxyAddress,
        LeagueOfLegendsLogicJSON.abi,
        signer
      );
      LeagueProxyContractWithSigner.once("Staked", stakedEventCallback);


      const RinkebyUSDCContract = new ethers.Contract(
        "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
        RinkebyUSDCJSON,
        signer
      );

      //Request that user approves their new league to withdraw USDC on behalf of their wallet
        //Required for staking
      const stakeAmount = await LeagueProxyContractWithSigner.stakeAmount();
      //TODO: set correct stakeamount
      const approvalTxn = await RinkebyUSDCContract
      .approve(newLeagueProxyAddress, stakeAmount * 10000000)
      .catch((error) => {
        //  console.log("Join League error: " + error.error.message);
         alert("Approve USDC error: " + error.message);
         setIsJoiningLeague(false);

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
         setIsJoiningLeague(false);

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
          // setIsCreatingLeague(false);

        });
      })

     

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
    // console.log("submission values: " + (formValues.inviteListStatus === "open"));
    //Send createLeague transaction to LeagueMaker
    const createLeagueTxn = await leagueMakerContractWithSigner
      .createLeague(
          formValues.leagueName,
          formValues.buyInCost,
          (formValues.inviteListStatus === "open"),
          connectedAccount,
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
        alert("Create League error: " + error.message);
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
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()
    // const currentAddress = await signer.getAddress()
    // console.log("target value = " + accountData.address);
    if(inviteListValuesNew.includes(e.target.value) || e.target.value === connectedAccount) {
      console.log("invalid address added");
      alert("No duplicate address allowed + no adding yourself to whitelist")
    } else {
      inviteListValuesNew[i] = e.target.value
      //setInviteListValues([...inviteListValues], e);
      setInviteListValues(inviteListValuesNew)
      // console.log("short list in func: " + inviteListValues);
    
    }


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
      
    
      {isConnected && !(isCreatingLeague || hasCreatedLeague) && (
        <>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs s>
            <Box
              component="div"
              sx={{
                '& > :not(style)': { m: 1, width: '50ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <Typography variant="h4" color="white" component="div">
                Form
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "5px"
                }}
              > 
                <br></br>
                <Typography
                  sx={{
                    minWidth: "15vw",
                    marginRight: "2vw"
                  }}
                >
                  League Name
                </Typography>
                <FormControl required>
                  {/* <StyledInputLabel htmlFor="league-name">League Name</StyledInputLabel> */}
                  <TextField
                    id="league-name"
                    value={formValues.leaguename}
                    onChange={handleInputChange}
                    label="League Name*"
                    placeholder="My Awesome League"
                    hiddenLabel
                    // focused
                    color="secondary"
                    name="leagueName"
                    // variant="filled"
                    error={!isValidLeagueName}
                  />
                  {/* <StyledOutlinedInput
                    id="league-name"
                    value={formValues.leaguename}
                    onChange={handleInputChange}
                    label="League Name"
                    name="leagueName"
                    error={!isValidLeagueName}
                  /> */}
                </FormControl>
              </Box>


              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "5px"
                }}
              >
                <Typography
                  sx={{
                    minWidth: "15vw",
                    marginRight: "2vw"
                  }}
                >
                  Token
                </Typography>
              <FormControl required >
                <StyledInputLabel htmlFor="token-select">Token</StyledInputLabel>
                <StyledSelect
                    color="secondary"
                
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
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "5px"
                }}
              >
                <Typography
                  sx={{
                      minWidth: "15vw",
                      marginRight: "2vw"
                    }}
                >
                  Buy-in Cost
                </Typography>
              <FormControl required>
                {/* <StyledInputLabel htmlFor="buy-in">Buy-In Cost</StyledInputLabel> */}
                <TextField
                  id="buy-in"
                  type="number"
                  color="secondary"
                  
                  value={formValues.leaguename}
                  onChange={handleInputChange}
                  label="Buy-In Cost"
                  // hiddenLabel
                  name="buyInCost"
                  placeholder='10'
                  endAdornment={<InputAdornment position="end">USDC</InputAdornment>}
                  error={!isValidBuyInCost}
                >

                </TextField>

              </FormControl>
              </Box>
              {/* <FormControl required sx={{ marginLeft: 3 }}>
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
              </FormControl> */}
              
              {/* <Button variant="contained" size="small" sx={{backgroundColor: "primary.light"}}>Submit</Button> */}
            </Box>
          </Grid>
          <Grid item xs s>
            <Box
                component="div"
                sx={{
                  '& > :not(style)': { m: 1, width: '50ch' },
                  color: "white",
                  alignItems: "left"

                }}

                noValidate
                autoComplete="off"
              >
                <Typography
                  variant="h4"
                >
                  Invite List (Whitelist)
                </Typography>
                <Box>
                <FormControl component="fieldset">
                  <FormGroup aria-label="position" row>

                  <FormControlLabel
                      value="start"
                      control={<Switch 
                        onChange={() => {
                          setIsPrivate(!isPrivate)
                        }}                                                                   
                      color="secondary" />}
                      label="Invite-Only"
                      labelPlacement="start"
                    />
                    </FormGroup>
                </FormControl>
                </Box>
              {/* TODO: Abstract this into another component, controlled by createLeague page */}
              {!(isPrivate) ? (
                <Typography variant="h7" color="lightgrey">
                    Anybody with a wallet address can search and join this league.
                </Typography>
                ) : (
                <>
                <Typography variant="h7" color="lightgrey">
                  Only users added to this leagues whitelist can join.
                </Typography>
                {!validAddressesStatus && ( 
                  <Typography
                    sx={{
                     color: "brown" 
                    }}
                  >
                    Please fix the invalid addresses below.
                  </Typography> 
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
                        // console.log("short list outside func: " + inviteListValues);
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
                    variant="contained"
                    onClick={addNewPlayerInviteInput}
                    size="small"
                    filled
                    disabled={!addPlayerBtnEnabled}
                  >
                    Add Another Address to Whitelist
                  </Button>


                </>
                
                )}
            </Box>
            
          </Grid>
        </Grid>
        <Fab 
          sx={{
            float: "right",
            background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
          }} 
          onClick={()=>{createLeagueSubmitHandler()}} variant="extended" size="medium" color="tertiary"
        >
            Create League
        </Fab>
          <br></br>

        </>
      )}
      {isCreatingLeague && (
        <Container maxWidth="lg" justifyContent="center" alignItems="center">
        <Box
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            display: "flex",
          }}
        >
          <Typography variant="h5" color="white" component="div">
            League Creation in progress
          </Typography>
          <br></br>
          <CircularProgress />
        </Box>
      </Container>
      )}
      {hasCreatedLeague && (
        <Box
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            display: "flex",
          }}
        >

          <br></br>
          <Link
            href={
              "https://rinkeby.etherscan.io/address/"
              + newLeagueAddress
              + "#internaltx"
            }
            target={"_blank"}
            rel="noreferrer"
            sx={{
              textDecoration: "none"
            }}
          >
              <Paper
                  elevation={5}
                  sx={{
                    background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    
                    marginRight: 3,
                    padding: 2
                  }}
                >
                    <Typography variant="h6">
                      {"Your Team Diff League \"" + newLeagueName + "\" has been created"}
                      <CheckCircleIcon fontSize={"large"} sx={{marginLeft:1}} color="secondary"></CheckCircleIcon>

                    </Typography>
              </Paper>
          </Link>
          <br></br> 
          {isJoiningLeague && (
            <Container maxWidth="lg" justifyContent="center" alignItems="center">
              <Box
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                sx={{
                  display: "flex",
                }}
              >
                <Typography variant="h5" color="white" component="div">
                  {"Joining newly created League: " + newLeagueName}
                </Typography>
                <br></br>
                <CircularProgress />
              </Box>
            </Container>
          )}
          {hasJoinedLeague && (
            <>
              < Link
                href={
                  "http://localhost:3000/leagues/"
                  + newLeagueAddress
                }
                target={"_blank"}
                rel="noreferrer"
              >
              <Paper
                  elevation={5}
                  sx={{
                    background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    flex: 1,
                    marginRight: 3,
                    padding: 2
                  }}
                >
                  <Typography variant="h6">
                    Succesfully joined league
                    <CheckCircleIcon fontSize={"large"} sx={{marginLeft:1}} color="secondary"></CheckCircleIcon>

                  </Typography>
                
              </Paper>      
              <Typography align="center" variant="subtitle1">
                  Click to view league on TeamDiff
              </Typography>        
              </Link>
              <br></br>
              <Fab
                variant='extended'
                size="large"
                // sx={{
                //   background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                // }}
                onClick={() => {
                  router.reload(window.location.pathname);
                }}
              >
                Create Another League
              </Fab>
              <br></br>
            </>
          )}
          
        </Box>
      )}
      {!isConnected && !hasCreatedLeague && !isCreatingLeague && (
            <Box>
              <Typography variant="h6" component="div">
                Please connect your wallet to get started.
              </Typography>
            </Box>
      )}
      
    </Box>
  )
}
