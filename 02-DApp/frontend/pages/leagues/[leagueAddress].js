import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Fab, Link, Paper, Typography } from "@mui/material";
// Web3 Imports
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// NPM import
import WAValidator from "wallet-address-validator";
// Contract imports
import * as CONTRACT_ADDRESSES from "../../../backend/contractscripts/contract_info/contractAddressesRinkeby.js";
import LeagueOfLegendsLogicJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json";
import RinkebyUSDCJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/RinkebyUSDCJSON.json";
import WhitelistJSON from "../../../backend/contractscripts/contract_info/rinkebyAbis/Whitelist.json";
import LoadingPrompt from "../../components/LoadingPrompt.js";
import constants from "../../constants/index.js";
// export default function LeagueDetails({ leagueData, leagueAddress, isJoined, setLeagueOpen }) {
export default function LeagueDetails() {
  // Router params
  const router = useRouter();

  // TODO change to matic network for prod
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );
  // const { data: signerData1, error: signerError, isLoading: signerLoading, isFetching, isSuccess, refetch } = useSigner()

  const [leagueProxyContract, setLeagueProxyContract] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  //   const [leagueAddress, setLeagueAddress] = useState(router.query.leagueAddress);
  const [isLeagueMember, setIsLeagueMember] = useState(false);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false);
  const [isOnWhitelist, setIsOnWhitelist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);

  const [athleteNFTs, setAthleteNFTs] = useState([]);
  const [nftResp, setNFTResp] = useState(null);
  const [lineup, setLineup] = useState([null, 11, 23, 34, 45]);
  const [isPublicLeague, setIsPublicLeague] = useState([false]);
  const [isSettingLineup, setIsSettingLineup] = useState(false);
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [hasJoinedLeague, setHasJoinedLeague] = useState(false);
  // const [import {  } from "module";]

  // Invite list states
  const [inviteListIsEnabled, setInviteListIsEnabled] = useState(false);
  const [inviteListValues, setInviteListValues] = useState([]);
  const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true);
  const [validAddressesStatus, setValidAddressesStatus] = useState(true);

  // Menu Import
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSetAthlete = (athleteNum) => {
    setAnchorEl(null);
    lineup[athleteNum] = athleteNum;
    // console.log("lineup: " + lineup);
  };

  const [signer, setSigner] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // setIsCreatingLeague(false);
    // setHasCreatedLeague(true);
    // setHasJoinedLeague(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // const fetchData = async () => {
    //   const currentAddress = await signer.getAddress()
    //   setAddressPreview(currentAddress)
    // }
    // fetchData()
    const setAccountData = async () => {
      // setIsLoading(true);
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
      // setIsLoading(false);
    };
    setAccountData();
    provider.provider.on("accountsChanged", (accounts) => {
      setAccountData();
    });
    provider.provider.on("disconnect", () => {
      // console.log("disconnected");
      setIsConnected(false);
    });
  }, [isConnected]);

  const stakedEventCallback = async (
    stakerAddress,
    stakeAmount,
    leagueAddress
  ) => {
    // console.log("inside staked callback");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // Check is admin of the newly created league is the currently logged in account
    // If true, proceed with league creation callback behavior
    const currentAddress = await signer.getAddress();
    if (stakerAddress === currentAddress) {
      setIsJoiningLeague(false);
      setIsTransactionDelayed(false);
      setHasJoinedLeague(true);
      // console.log("pushing router");
      // TODO this is buggy, causes the window to reload like 6 times
      // router.reload(window.location.pathname);
      // router.push("/leagues/" + leagueAddress);
      // router.reload(window.location.pathname);

      // setStakerAddress(stakerAddress)
    } else {
      // console.log(stakerAddress + " != " + currentAddress);
    }
  };

  useEffect(() => {
    setAthleteNFTs([]);
    if (isConnected && router.isReady) {
      setIsLoading(true);
      // Initialize connections to GameItems contract
      const LeagueProxyContract = new ethers.Contract(
        router.query.leagueAddress,
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      setLeagueProxyContract(LeagueProxyContract);
      if (isLoading) {
        LeagueProxyContract.once("Staked", stakedEventCallback);
        // console.log("proxy callback set");
      }
      // const white

      async function fetchData() {
        setIsLoading(true);
        const leagueName = await LeagueProxyContract.leagueName();
        setLeagueName(leagueName);
        const isInLeague = await LeagueProxyContract.inLeague(connectedAccount);
        setIsLeagueMember(isInLeague);
        console.log("isInLeage: " + isInLeague);
        if (isInLeague) {
          // router.push("./" + router.query.leagueAddress + "/myTeam");
          router.push("./" + router.query.leagueAddress + "/matchups");
        }
        // // console.log("isInLeague: " + isInLeague)
        // Get whitelist of Proxy, to confirm connected user is on whitelist
        const whitelistAddress = await LeagueProxyContract.whitelistContract();
        // console.log("whitelistAddy: " + whitelistAddress);
        const WhitelistContract = new ethers.Contract(
          whitelistAddress,
          WhitelistJSON.abi,
          provider
        );
        // const isOnWhitelist = await WhitelistContract.whitelist(
        //   accountData.address
        // );

        const isOnWhitelist = await WhitelistContract.whitelist(
          connectedAccount
        );
        setIsOnWhitelist(isOnWhitelist);

        const isPublicLeague = await WhitelistContract.isPublic();
        setIsPublicLeague(isPublicLeague);

        const leagueAdmin = await LeagueProxyContract.admin();
        setIsLeagueAdmin(leagueAdmin == connectedAccount);

        // TODO this is slightly buggy when someone tries to switch accounts
        setIsLoading(false);
      }

      // declare the async data fetching function
      const getNFTData = async () => {
        const web3 = createAlchemyWeb3(constants.RINKEBY_ALCHEMY_LINK);

        const nfts = await web3.alchemy.getNfts({
          owner: connectedAccount,
          contractAddresses: [CONTRACT_ADDRESSES.GameItems],
        });

        setNFTResp(nfts);
        for (const nft of nfts?.ownedNfts) {
          const token = nft?.id?.tokenId;
          const response = await web3.alchemy.getNftMetadata({
            contractAddress: constants.CONTRACT_ADDR,
            tokenId: token,
          });
          // console.log("Token #" + token + " metadata: " + JSON.stringify(response, null, 2));
          if (!response.title?.includes("Pack")) {
            setAthleteNFTs((athleteNFTs) => [...athleteNFTs, response]);
          }
        }
      };
      fetchData();

      getNFTData().catch((error) => {
        console.log("fetch NFT DATA error: " + error);
      });
    } else {
      // alert("no account data or league Address found, please refresh.");
      // console.log("no account data or league Address found");
      // console.log("router: " + JSON.stringify(router.query, null, 2));
      //   console.log("leagueAddLress: " + leagueAddress);
    }
  }, [isConnected, router.isReady, connectedAccount]);

  useEffect(() => {
    let flag = true;
    inviteListValues.forEach((e) => {
      if (WAValidator.validate(e, "ETH")) {
        // console.log("validated")
      } else {
        // console.log("invalid")
        flag = false;
        setValidAddressesStatus(false);
      }
    });
    if (flag) {
      setValidAddressesStatus(true);
    }
  }, [inviteListValues]);

  const handlePlayerInviteInput = (e, i) => {
    const inviteListValuesNew = [...inviteListValues];
    inviteListValuesNew[i] = e.target.value;
    // setInviteListValues([...inviteListValues], e);
    setInviteListValues(inviteListValuesNew);
    // console.log("short list in func: " + inviteListValues);
  };

  const addNewPlayerInviteInput = () => {
    if (addPlayerBtnEnabled && inviteListValues.length >= 7) {
      setAddPlayerBtnEnabled(false);
    }
    setInviteListValues((prevState) => [...prevState, ""]);
  };

  const removePlayer = (i) => {
    const inviteListValuesNew = [...inviteListValues];
    inviteListValuesNew.splice(i, 1);
    setInviteListValues(inviteListValuesNew);
    if (!addPlayerBtnEnabled && inviteListValuesNew.length < 8) {
      setAddPlayerBtnEnabled(true);
    }
  };

  const joinLeagueHandler = async () => {
    let hasCancelledTransaction = false;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const RinkebyUSDCContract = new ethers.Contract(
      "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
      RinkebyUSDCJSON,
      signer
    );
    const stakeAmount = await leagueProxyContract.stakeAmount();
    const approvalTxn = await RinkebyUSDCContract.approve(
      router.query.leagueAddress,
      stakeAmount * 1000000
    ).catch((error) => {
      setIsJoiningLeague(false);
      hasCancelledTransaction = true;
      // console.log("Join League error: " + error.message);
      alert("Approve error: " + error.message);
    });

    // console.log("joining league: " + router.query.leagueAddress);

    // console.log("signer dataL: " + JSON.stringify(signerData, null, 2));
    if (!hasCancelledTransaction) {
      const leagueProxyContractWithSigner = leagueProxyContract.connect(signer);
      const joinLeagueTxn = await leagueProxyContractWithSigner
        // .joinLeague()
        .joinLeague({
          gasLimit: 20000000,
        })
        .then((res) => {
          setIsJoiningLeague(true);
          window.setTimeout(() => {
            setIsTransactionDelayed(true);
          }, 60 * 5 * 1000);
        })
        .catch((error) => {
          setIsJoiningLeague(false);
          // console.log("Join League error: " + error.message);
          alert("Join League error: " + error.message);
        });
    }
  };

  const submitAddUsersToWhitelistClickHandler = async () => {
    // if(signerData) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const leagueProxyContractWithSigner = leagueProxyContract.connect(signer);
    inviteListValues.forEach(async (invitedAddress, index) => {
      const addUserToWhitelistTxn = await leagueProxyContractWithSigner
        .addUserToWhitelist(invitedAddress, {
          gasLimit: 1000000,
        })
        .then((res) => {
          // console.log("txn result: " + JSON.stringify(res, null, 2));
          // // console.log("Txn: " + JSON.stringify(addUserToWhitelistTxn, null, 2))
          // console.log("joined league");
        })
        .catch((error) => {
          // console.log("")
          alert("addUserToWhitelistTxn error: " + error.message);
        });
    });

    // }
    // else {
    //   console.log("singer Data not set in add user to whitelist function ");
    // }
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingPrompt loading={"Your League"} />
      ) : (
        <>
          {!isLeagueMember && (
            <>
              {isOnWhitelist && !isJoiningLeague && !hasJoinedLeague ? (
                <Box
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  sx={{
                    display: "flex",
                  }}
                >
                  <Typography variant="h5">
                    {"You are whitelisted for this league. Click below to accept the invitation to: " +
                      leagueName}
                  </Typography>
                  <br></br>
                  <Fab
                    onClick={joinLeagueHandler}
                    variant="extended"
                    sx={{
                      background:
                        "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    }}
                  >
                    {'Join "' + leagueName + '"'}
                  </Fab>
                </Box>
              ) : (
                <>
                  {isPublicLeague && !isJoiningLeague && !hasJoinedLeague ? (
                    <Box
                      justifyContent="center"
                      alignItems="center"
                      flexDirection="column"
                      sx={{
                        display: "flex",
                      }}
                    >
                      <Typography variant="h5">
                        {"This is a public league. Click below to join: " +
                          leagueName}
                      </Typography>
                      <br></br>
                      <Fab
                        onClick={joinLeagueHandler}
                        variant="extended"
                        sx={{
                          background:
                            "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                        }}
                      >
                        {'Join "' + leagueName + '"'}
                      </Fab>
                    </Box>
                  ) : (
                    !isJoiningLeague &&
                    !hasJoinedLeague && (
                      <Box
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        sx={{
                          display: "flex",
                        }}
                      >
                        <Typography>
                          {"IDK how tf you got here, but you aren't whitelisted for this private league, therefore you cannot join at this time." +
                            " Please contact the admin of the league if you would like to be added."}
                        </Typography>
                      </Box>
                    )
                  )}
                </>
              )}
              {isJoiningLeague && (
                <LoadingPrompt
                  completeTitle={"Joining League"}
                  bottomText={
                    isJoiningLeague && isTransactionDelayed
                      ? "This is taking longer than normal. Please check your wallet to check the status of this transaction."
                      : ""
                  }
                />
              )}
              {hasJoinedLeague && (
                <>
                  <Link>
                    <a
                      className="primary-link"
                      href={
                        "http://localhost:3000/leagues/" +
                        router.query.leagueAddress
                      }
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
                          width: "50vw",
                          margin: "auto",
                        }}
                      >
                        <Typography textAlign="center" variant="h6">
                          {'Succesfully joined league "' + leagueName + '"'}
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
                    </a>
                  </Link>
                  <br></br>
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
