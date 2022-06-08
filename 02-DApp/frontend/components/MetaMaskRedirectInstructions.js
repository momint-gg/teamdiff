import { Link, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import React from "react";

export default function MetaMaskRedirectInstructions() {
  return (
    <>
      <Typography variant="h4">
        {
          "Oops! To use this DApp, we rely on an awesome tool called MetaMask, which we didn't find in your browser."
        }
      </Typography>
      <br></br>
      <Typography variant="h5">{" If you are either: "}</Typography>
      <br></br>
      <Typography variant="h6">
        {'1.) Connecting from a mobile device, you will need to install MetaMask Mobile, and open "https://teamdiff.xyz" in your MetaMask Mobile Browser, ' +
          " or click "}
        <Link>
          <a
            className="primary-link"
            target="_blank"
            href={"https://metamask.app.link/dapp/teamdiff.xyz/"}
            rel="noreferrer"
          >
            this link
          </a>
        </Link>
        {" to be automatically redirected there."}
      </Typography>
      <Typography>
        *Note, you will be prompted to download the MetaMask app if you don't
        have it installed on your phone
      </Typography>
      <br></br>
      <Typography variant="h6">
        {
          "2.) Connecting from a desktop device, you will need to install the MetaMask Brower Extension, or can click the same link above to be automatically redirected to their download page."
        }
      </Typography>
    </>
  );
}
