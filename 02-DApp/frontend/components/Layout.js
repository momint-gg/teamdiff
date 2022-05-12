import React from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import WalletLogin from "../components/WalletLogin";
import logo from "../assets/images/logo-horizontal.png";
import Footer from "./Footer";
import NavLink from "./NavLink";

const Layout = ({ children }) => {
  const pages = [
    { name: "PLAY", href: "/play" },
    { name: "COLLECTION", href: "/collection" },
    { name: "MINT", href: "/mintHome" },
    { name: "BURN", href: "/burnPack" },
  ];

  return (
    <>
      <Box component="div" height="100%" backgroundColor="primary.dark">
        <Box component="body" height="100vh" backgroundColor="primary.dark">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1,
              m: 1,
              borderRadius: 1,
              alignItems: "center",
              backgroundColor: "primary.dark",
            }}
          >
            <Image src={logo} alt="TeamDiff logo" width="300px" height="75px" />
            <WalletLogin />
          </Box>
          <Box
            sx={{
              display: "flex",
              paddingRight: 1,
              paddingLeft: 1,
              paddingTop: 1,
              marginRight: 1,
              marginLeft: 1,
              marginTop: 1,
              borderRadius: 1,
              backgroundColor: "primary.dark",
              display: "flex",
            }}
          >
            {pages.map((page) => (
              <NavLink key={page.name} href={page.href}>
                {page.name}
              </NavLink>
            ))}
          </Box>
          <hr
            style={{
              color: "white",
              backgroundColor: "white",
              height: 4,
              marginTop: -4,
            }}
          />
          <Box sx={{ paddingLeft: 5, paddingRight: 5 }}>
            <div>{children}</div>
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
};

export default Layout;