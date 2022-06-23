import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Button,
  Fab,
  FormControlLabel,
  FormGroup,
  Link,
  OutlinedInput,
  outlinedInputClasses,
  Paper,
  styled,
  Switch,
  Typography
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
// import Link from '@mui/material/Link'
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
// import 'bootstrap/dist/css/bootstrap.css'
import TextField from "@mui/material/TextField";
import "bootstrap/dist/css/bootstrap.css";
import { ethers } from "ethers";
// Router
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// import wallet_address_validator from 'wallet-address-validator';
// https://www.npmjs.com/package/wallet-address-validator
import WAValidator from "wallet-address-validator";
import * as CONTRACT_ADDRESSES from "../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
// import RinkebyUSDCJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/RinkebyUSDCJSON.json";
import ERC20JSON from "../../backend/contractscripts/contract_info/rinkebyAbis/ERC20.json";
import LeagueMakerJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueMaker.json";
import LeagueOfLegendsLogicJSON from "../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import AddToWhitelist from "../components/AddToWhitelist.js";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt.js";
import LoadingPrompt from "../components/LoadingPrompt.js";

// https://codesandbox.io/s/outlinedinput-border-color-29715?fontsize=14&hidenavigation=1&theme=dark&file=/demo.js:747-767
// https://codesandbox.io/s/textfield-outlined-forked-0o0bdi?file=/src/index.js
const StyledOutlinedInput = styled(OutlinedInput)`
  &.MuiOutlinedInput-root.Mui-focused {
    color: white;
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: white;
  }
`;

const StyledInputLabel = styled(InputLabel)`
  &.Mui-focused {
    color: white;
  }
`;

const StyledSelect = styled(Select)`
  &.Mui-focused {
    color: white;
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: white;
  }
`;

const StyledButton = styled(Button)`
  color: white;
  background-color: ${(props) => props.theme.palette.primary.light};
  height: 40px;
  &:hover {
    filter: brightness(85%);
    background-color: ${(props) => props.theme.palette.primary.light};
    // color: white;
  }
`;

export default function CreateLeague({ setDisplay }) {
  const defaultValues = {
    leagueName: "",
    token: "usdc",
    buyInCost: "",
    payoutSplit: "default",
    whitelistedAddresses: [],
    inviteListStatus: "open",
  };

  // WAGMI Hooks

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );

  // Router
  const router = useRouter();

  // Contract State Hooks
  const [leagueMakerContract, setLeagueMakerContract] = useState(null);
  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);

  const [hasCreatedLeague, setHasCreatedLeague] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState(null);
  const [newLeagueAddress, setNewLeagueAddress] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [hasJoinedLeague, setHasJoinedLeague] = useState(false);
  // const [inviteListIsEnabled, setInviteListIsEnabled] = useState(false)
  // Rendering stat hooks
  const [inviteListValues, setInviteListValues] = useState([]);
  // const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true)
  const [validAddressesStatus, setValidAddressesStatus] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isValidBuyInCost, setIsValidBuyInCost] = useState(true);
  const [isValidLeagueName, setIsValidLeagueName] = useState(true);
  const [isValidInviteList, setIsValidInviteList] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const preparedInviteListValues = inviteListValues.filter(
    (address) => address !== ""
  );

  useEffect(() => {
    // setIsCreatingLeague(false);
    // setHasCreatedLeague(true);
    // setHasJoinedLeague(true)
    // setIsConnected(false)

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // const fetchData = async () => {
    //   const currentAddress = await signer.getAddress()
    //   setAddressPreview(currentAddress)
    // }
    // fetchData()
    const setAccountData = async () => {
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const accountAddress = await signer.getAddress();
        setSigner(signer);
        setConnectedAccount(accountAddress);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };
    setAccountData();
    provider.provider.on("accountsChanged", (accounts) => {
      setAccountData();
    });
    provider.provider.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });
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
    // TODO filter
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
    // TODO this still triggers more than once sometimes idk whyyyyy
    LeagueMakerContract.once("LeagueCreated", leagueCreatedCallback);
  }, []);

  // Callback for when a STaked event is fired from leagueProxy contract (occurs when user stakes USDC to joinLeague)
  const stakedEventCallback = async (
    stakerAddress,
    stakeAmount,
    leagueAddress
  ) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // Check is admin of the newly created league is the currently logged in account
    // If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if (stakerAddress === currentAddress) {
      setIsJoiningLeague(false);
      setIsTransactionDelayed(false);
      setHasJoinedLeague(true);
      // router.reload(window.location.pathname);

      // setStakerAddress(stakerAddress)
    } else {
      console.log(stakerAddress + " != " + currentAddress);
    }
  };

  // Callback for when league created event is fired from league maker contract
  const leagueCreatedCallback = async (
    newLeagueName,
    newLeagueProxyAddress,
    newLeagueAdminAddress,
    initialWhitelistAddresses,
    stakeTokenAddress
  ) => {
    // Get Provider of session, and create wallet signer object from provider (to sign transactions as user)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // Check is admin of the newly created league is the currently logged in account
    // If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if (currentAddress == newLeagueAdminAddress) {
      // Update state hooks
      setIsCreatingLeague(false);
      setIsTransactionDelayed(false);
      setHasCreatedLeague(true);
      setNewLeagueName(newLeagueName);
      setNewLeagueAddress(newLeagueProxyAddress);
      setIsJoiningLeague(true);

      // Construct LeagueProxyContract with signer
      const LeagueProxyContractWithSigner = new ethers.Contract(
        newLeagueProxyAddress,
        LeagueOfLegendsLogicJSON.abi,
        signer
      );
      LeagueProxyContractWithSigner.once("Staked", stakedEventCallback);

      const TokenContract = new ethers.Contract(
        stakeTokenAddress,
        // does this need to be a special json, or are all erc20 json the same
        ERC20JSON,
        signer
      );

      // Request that user approves their new league to withdraw USDC on behalf of their wallet
      // Required for staking
      const stakeAmount = await LeagueProxyContractWithSigner.stakeAmount();
      // TODO: set correct stakeamount
      const approvalTxn = await TokenContract.approve(
        newLeagueProxyAddress,
        stakeAmount * 1000000
      ).catch((error) => {
        //  console.log("Join League error: " + error.error.message);
        alert("Approve USDC error: " + error.message);
        setIsJoiningLeague(false);
      });

      // Send request to user to join the league
      // const joinNewlyCreatedLeagueTxn =
      await LeagueProxyContractWithSigner.joinLeague({
        gasLimit: 1000000,
      })
        .then((res) => {
          console.log("joining newly created league...");
          window.setTimeout(() => {
            setIsTransactionDelayed(true);
          }, 30 * 1000);
        })
        .catch((error) => {
          //  console.log("Join League error: " + error.error.message);
          alert("Join League error: " + error.message);
          setIsJoiningLeague(false);
        });

      // For each address on the initial whitelist, send transaction to add address to whitelist of new league
      initialWhitelistAddresses.forEach(async (whitelistAddress) => {
        const addUsersToWhitelistTxn =
          await LeagueProxyContractWithSigner.addUserToWhitelist(
            whitelistAddress,
            {
              gasLimit: 10000000,
            }
          )
            .then
            // console.log("Added userr to whitelist success")
            ()
            .catch((error) => {
              // console.log("")
              alert("Add User To WhiteList error: " + error.message);
              // setIsCreatingLeague(false);
            });
      });
    }
  };

  // Hanlder for form submit
  const createLeagueSubmitHandler = async () => {
    // Get Provider of session, and create wallet signer object from provider (to sign transactions as user)
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()

    console.log("league name" + formValues.leagueName);
    if (formValues.leagueName === "") {
      alert("Please enter valid league name.");
    } else if (formValues.token === "") {
      alert("Please select a token.");
    } else if (formValues.buyInCost > 100) {
      alert("Please enter a buy-in cost below 100 USDC.");
    } else {
      let stakeTokenAddress;
      switch (formValues.token) {
        case "usdc":
          stakeTokenAddress = CONTRACT_ADDRESSES.rinkebyUSDCAddress;
          // stakeTokenAddress = CONTRACT_ADDRESSES.polygonUSDCAddress;
          break;
        case "ETH":
          stakeTokenAddress = CONTRACT_ADDRESSES.chainlinkTokenAddress;
          // stakeTokenAddress = CONTRACT_ADDRESSES.wrappedEthAddress;
          break;
        // TODO update for prod
        // case "MATIC":
        //   // stakeTokenAddress = CONTRACT_ADDRESSES.maticAddress
        //   break;
        default:
          stakeTokenAddress = CONTRACT_ADDRESSES.rinkebyUSDCAddress;
          break;
      }
      // Connect to leagueMaker with connect wallet
      const leagueMakerContractWithSigner = leagueMakerContract.connect(signer);
      // console.log("submission values: " + (formValues.inviteListStatus === "open"));
      // Send createLeague transaction to LeagueMaker
      const createLeagueTxn = await leagueMakerContractWithSigner
        .createLeague(
          formValues.leagueName,
          formValues.buyInCost,
          // 10,
          !isPrivate,
          // false,
          connectedAccount,
          stakeTokenAddress,
          CONTRACT_ADDRESSES.Athletes,
          CONTRACT_ADDRESSES.GameItems,
          inviteListValues,
          // [],
          {
            gasLimit: 10000000,
          }
        )
        .then((res) => {
          // console.log("txn result: " + JSON.stringify(res, null, 2));
          setIsCreatingLeague(true);
          window.setTimeout(() => {
            setIsTransactionDelayed(true);
          }, 15 * 1000);

          console.log("League Creation in progress...");
          // console.log("With invite values: " + inviteListValues);
          // how to tell if transaction failed?
          // TODO print message to alert if it takes mroe than 60 seconds
        })
        .catch((error) => {
          alert("Create League error: " + error.message);
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name)
    setFormValues({
      ...formValues,
      [name]: value,
    });
    // console.log(formValues)
  };

  useEffect(() => {
    if (formValues.leagueName.length > 100) {
      setIsValidLeagueName(false);
    } else if (!isValidLeagueName) {
      setIsValidLeagueName(true);
    }
  }, [formValues.leagueName]);

  useEffect(() => {
    if (formValues.buyInCost === "") {
      setIsValidBuyInCost(true);
    } else if (
      isNaN(formValues.buyInCost) ||
      Number(formValues.buyInCost) < 0 ||
      Number(formValues.buyInCost) > 100
    ) {
      // console.log("uhoh")
      // console.log(typeof formValues.buyInCost, formValues.buyInCost)
      setIsValidBuyInCost(false);
    } else if (!isValidBuyInCost) {
      setIsValidBuyInCost(true);
    }
    // console.log("--", parseInt(formValues.buyInCost))
  }, [formValues.buyInCost]);

  const validateFormValues = () => {
    return (
      isValidBuyInCost &&
      formValues.buyInCost !== "" &&
      isValidLeagueName &&
      formValues.leagueName !== "" &&
      (formValues.inviteListStatus === "open" ||
        (preparedInviteListValues.length > 0 && validAddressesStatus))
    );
  };

  useEffect(() => {
    let flag = true;
    inviteListValues.forEach((e) => {
      if (WAValidator.validate(e, "ETH")) {
        // console.log("validated")
      } else {
        // console.log("invalid")
        if (e !== "") {
          flag = false;
          setValidAddressesStatus(false);
        }
      }
    });
    if (flag) {
      setValidAddressesStatus(true);
    }
  }, [inviteListValues]);

  // const handlePlayerInviteInput = (e, i) => {
  //   let inviteListValuesNew = [...inviteListValues]
  //   // const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   // const signer = provider.getSigner()
  //   // const currentAddress = await signer.getAddress()
  //   // console.log("target value = " + accountData.address);
  //   if(inviteListValuesNew.includes(e.target.value) || e.target.value == connectedAccount) {
  //     console.log("invalid address added");
  //     alert("No duplicate address allowed + no adding yourself to whitelist")
  //   } else {
  //     inviteListValuesNew[i] = e.target.value
  //     //setInviteListValues([...inviteListValues], e);
  //     setInviteListValues(inviteListValuesNew)
  //     // console.log("short list in func: " + inviteListValues);

  //   }

  // }

  // const addNewPlayerInviteInput = () => {
  //   if (addPlayerBtnEnabled && inviteListValues.length >= 7) {
  //     setAddPlayerBtnEnabled(false)
  //   }
  //   setInviteListValues(prevState => ([...prevState, ""]))
  // }

  // const removePlayer = (i) => {
  //   let inviteListValuesNew = [...inviteListValues]
  //   inviteListValuesNew.splice(i, 1)
  //   setInviteListValues(inviteListValuesNew)
  //   if (!addPlayerBtnEnabled && inviteListValuesNew.length < 8) {
  //     setAddPlayerBtnEnabled(true)
  //   }
  // }

  // function handleShowForm() {
  //   setShowForm(true)
  // }

  return (
    <Box
      sx={{
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {isConnected && !(isCreatingLeague || hasCreatedLeague) && (
        <>
          {/* <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs s> */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              // alignItems: "flex-start"
            }}
          >
            <Box
              // component="div"
              sx={{
                // '& > :not(style)': { m: 1, width: '50ch' },
                flex: 1,
              }}
              // noValidate
              // autoComplete="off"
            >
              <Typography variant="h4" color="white" component="div">
                Form
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "5px",
                }}
              >
                <br></br>
                <Typography
                  sx={{
                    minWidth: "15vw",
                    marginRight: "2vw",
                  }}
                >
                  League Name
                </Typography>
                <FormControl fullWidth required>
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
                  padding: "5px",
                }}
              >
                <Typography
                  sx={{
                    minWidth: "15vw",
                    marginRight: "2vw",
                  }}
                >
                  Token
                </Typography>
                <FormControl fullWidth required>
                  {/* <FormControl fullWidth required > */}
                  <InputLabel id="token-select-label">Token</InputLabel>
                  <Select
                    color="secondary"
                    labelId="token-select-label"
                    id="token-select"
                    // value={"USDC"}
                    value={formValues.token}
                    // defaultValue="USDC"
                    label="token"
                    name="token"
                    onChange={handleInputChange}
                  >
                    <MenuItem key="usdc" value="usdc">
                      USDC
                    </MenuItem>
                    <MenuItem key="ETH" value="ETH">
                      ETH
                    </MenuItem>
                    {/* <MenuItem key="MATIC" value="MATIC">
                      MATIC
                    </MenuItem> */}
                  </Select>
                  {/* </FormControl> */}
                </FormControl>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "5px",
                }}
              >
                <Typography
                  sx={{
                    minWidth: "15vw",
                    marginRight: "2vw",
                  }}
                >
                  Buy-in Cost
                </Typography>
                <FormControl fullWidth required>
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
                    placeholder="10"
                    endAdornment={
                      <InputAdornment position="end">USDC</InputAdornment>
                    }
                    error={!isValidBuyInCost}
                  ></TextField>
                </FormControl>
              </Box>
            </Box>
            {/* </Grid>
          <Grid item xs s> */}
            <Box
              // component="div"
              sx={{
                // '& > :not(style)': { m: 1, width: '50ch' },
                // color: "white",
                // alignItems: "left",
                flex: 1,
              }}

              // noValidate
              // autoComplete="off"
            >
              <Typography variant="h4" color="primary">
                Invite List (Whitelist)
              </Typography>
              <Box>
                <FormControl component="fieldset">
                  <FormGroup aria-label="position" row>
                    <FormControlLabel
                      value="start"
                      control={
                        <Switch
                          onChange={() => {
                            setIsPrivate(!isPrivate);
                            if (isPrivate) {
                              setInviteListValues([]);
                              // console.log("empty list")
                            }
                          }}
                        />
                      }
                      sx={{ color: "white" }}
                      label="Invite-Only"
                      labelPlacement="start"
                    />
                  </FormGroup>
                </FormControl>
              </Box>
              {/* TODO: Abstract this into another component, controlled by createLeague page */}
              {!isPrivate ? (
                <Typography variant="h7" color="lightgrey">
                  Anybody with a wallet address can search and join this league.
                </Typography>
              ) : (
                <>
                  <Typography variant="h7" color="lightgrey">
                    Only Address manually added to the whitelist can join this
                    league
                  </Typography>
                  <AddToWhitelist
                    setInviteListValues={setInviteListValues}
                    inviteListValues={inviteListValues}
                    connectedAccount={connectedAccount}
                  ></AddToWhitelist>
                </>
              )}
            </Box>
          </Box>
          {/* </Grid>
        </Grid> */}
          <Fab
            sx={{
              float: "right",
              background: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
            }}
            onClick={() => {
              createLeagueSubmitHandler();
            }}
            variant="extended"
            size="medium"
          >
            Create League
          </Fab>
          <br></br>
        </>
      )}
      {isCreatingLeague && (
        <LoadingPrompt
          completeTitle={"Creating Your League..."}
          bottomText={
            isCreatingLeague && isTransactionDelayed
              ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
              : ""
          }
        />
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
          <Link>
            <a
              className="primary-link"
              href={
                "https://rinkeby.etherscan.io/address/" +
                newLeagueAddress +
                "#internaltx"
              }
              target={"_blank"}
              rel="noreferrer"
              sx={{
                textDecoration: "none",
              }}
            >
              <Paper
                elevation={5}
                sx={{
                  background:
                    "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",

                  marginRight: 3,
                  padding: 2,
                }}
              >
                <Typography variant="h6">
                  {'Your TeamDiff league "' +
                    newLeagueName +
                    '" has been created'}
                  <CheckCircleIcon
                    fontSize={"large"}
                    sx={{ marginLeft: 1 }}
                    color="secondary"
                  ></CheckCircleIcon>
                </Typography>
              </Paper>
            </a>
          </Link>
          <br></br>
          {isJoiningLeague && (
            <LoadingPrompt
              completeTitle={"Joining Newly Created League..."}
              bottomText={
                isJoiningLeague && isTransactionDelayed
                  ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
                  : ""
              }
            />
          )}
          {hasJoinedLeague && (
            <>
              <Link
                href={"http://localhost:3000/leagues/" + newLeagueAddress}
                target={"_blank"}
                rel="noreferrer"
              >
                <Paper
                  elevation={5}
                  sx={{
                    background:
                      "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    flex: 1,
                    marginRight: 3,
                    padding: 2,
                  }}
                >
                  <Typography variant="h6">
                    {'Succesfully joined league: "' + newLeagueName + '"'}
                    <CheckCircleIcon
                      fontSize={"large"}
                      sx={{ marginLeft: 1 }}
                      color="secondary"
                    ></CheckCircleIcon>
                  </Typography>
                </Paper>
                <Typography align="center" variant="subtitle1">
                  Click to view league on TeamDiff
                </Typography>
              </Link>
              <br></br>
              <Fab
                variant="extended"
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
        <ConnectWalletPrompt accessing={"creating a league"} />
      )}
    </Box>
  );
}
