<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import theme from "../styles/theme.js";
import {
  Box,
  Link,
  FormLabel,
  FormGroup,
  Switch,
  CircularProgress,
  Typography,
  Button,
  Chip,
  Container,
  Paper,
  Fab,
  OutlinedInput,
  styled,
  outlinedInputClasses,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@material-ui/core/Grid";
// import wallet_address_validator from 'wallet-address-validator';
// https://www.npmjs.com/package/wallet-address-validator
import WAValidator from "wallet-address-validator";
=======
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
import { Box, Button, Container, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect, useState } from "react";
// import wallet_address_validator from 'wallet-address-validator';
// https://www.npmjs.com/package/wallet-address-validator
import WAValidator from "wallet-address-validator";
import theme from "../styles/theme.js";
<<<<<<< HEAD
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

export default function AddToWhitelist({
  setInviteListValues,
  inviteListValues,
  connectedAccount,
}) {
  const [validAddressesStatus, setValidAddressesStatus] = useState(true);
  const [addPlayerBtnEnabled, setAddPlayerBtnEnabled] = useState(true);

  useEffect(() => {
    let flag = true;
    inviteListValues.forEach((e) => {
      if (WAValidator.validate(e, "ETH")) {
        // console.log("val idated")
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
<<<<<<< HEAD
<<<<<<< HEAD
    let inviteListValuesNew = [...inviteListValues];
=======
    const inviteListValuesNew = [...inviteListValues];
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
    const inviteListValuesNew = [...inviteListValues];
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()
    // const currentAddress = await signer.getAddress()
    // console.log("target value = " + accountData.address);
    if (
      inviteListValuesNew.includes(e.target.value) ||
      e.target.value == connectedAccount
    ) {
      console.log("invalid address added");
      alert("No duplicate address allowed + no adding yourself to whitelist");
    } else {
      inviteListValuesNew[i] = e.target.value;
<<<<<<< HEAD
<<<<<<< HEAD
      //setInviteListValues([...inviteListValues], e);
=======
      // setInviteListValues([...inviteListValues], e);
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
      // setInviteListValues([...inviteListValues], e);
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
      setInviteListValues(inviteListValuesNew);
      // console.log("short list in func: " + inviteListValues);
    }
  };

  const addNewPlayerInviteInput = () => {
    if (addPlayerBtnEnabled && inviteListValues.length >= 7) {
      setAddPlayerBtnEnabled(false);
    }
    setInviteListValues((prevState) => [...prevState, ""]);
  };

  const removePlayer = (i) => {
<<<<<<< HEAD
<<<<<<< HEAD
    let inviteListValuesNew = [...inviteListValues];
=======
    const inviteListValuesNew = [...inviteListValues];
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
    const inviteListValuesNew = [...inviteListValues];
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
    inviteListValuesNew.splice(i, 1);
    setInviteListValues(inviteListValuesNew);
    if (!addPlayerBtnEnabled && inviteListValuesNew.length < 8) {
      setAddPlayerBtnEnabled(true);
    }
  };

  return (
    <Container>
      {!validAddressesStatus && (
        <Typography
          sx={{
            color: "brown",
          }}
        >
          Please fix the invalid addresses below.
        </Typography>
      )}

      {/* https://bapunawarsaddam.medium.com/add-and-remove-form-fields-dynamically-using-react-and-react-hooks-3b033c3c0bf5 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {inviteListValues.map((element, index) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextField
              variant="standard"
              label={"Whitelisted Address " + (index + 1)}
              onChange={(e) => {
<<<<<<< HEAD
<<<<<<< HEAD
                //This submits null address when I copy and paste
=======
                // This submits null address when I copy and paste
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
                // This submits null address when I copy and paste
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
                handlePlayerInviteInput(e, index);
                // console.log("short list outside func: " + inviteListValues);
              }}
              sx={{
                flex: 2,
              }}
              value={element}
              key={index}
            />
            {
              <Button
                variant="outlined"
                color="error"
                onClick={() => removePlayer(index)}
                size="small"
              >
                Remove
              </Button>
            }
          </Box>
        ))}
      </Box>
      {/* <br></br> */}
      <Button
        variant="contained"
        onClick={addNewPlayerInviteInput}
        size="small"
        // color="secondary"
        filled
        disabled={!addPlayerBtnEnabled}
        sx={{
          marginTop: 3,
          // backgroundColor: theme.palette.secondary.main,
          color: theme.palette.primary.charcoal,
        }}
      >
        Add Another Address to Whitelist
      </Button>
    </Container>
  );
}
