import React from "react";
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import WalletLogin from "../components/WalletLogin";
import logo from "../assets/images/logo-horizontal.png";
import Footer from "./Footer";
import NavLink from "./NavLink";

const Layout = ({ children, isMobile }) => {
  const pages = [
    { name: "PLAY", href: "/play" },
    { name: "COLLECTION", href: "/collection" },
    { name: "MINT", href: "/mintHome" },
    { name: "BURN", href: "/burnPack" },
  ];

  console.log(isMobile);
  return (
    <>
      <Box component="div" height="100%" backgroundColor="primary.dark">
        <Box component="body" height="100vh" backgroundColor="primary.dark">
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: "row",
              p: 1,
              m: 1,
              borderRadius: 1,
              alignItems: "center",
              backgroundColor: "primary.dark",
            }}
          >
            {/* {isWeb && <Typography>WEB</Typography>} */}
            {/* {!isMobile && <Typography>MOBILE</Typography>} */}
            <Container alignSelf={"flex-start"}>
            <Image src={logo} alt="TeamDiff logo" width="300px" height="75px"/>
            </Container>
            {pages.map((page) => (
              <NavLink key={page.name} href={page.href} isMobile={isMobile}>
                {page.name}
              </NavLink>
            ))}
            <WalletLogin isMobile={isMobile}/>
          </Box>
          {isMobile? 
            <hr
              style={{
                color: "white",
                backgroundColor: "white",
                height: 4,
                marginTop: -0.5,
              }}
            /> 
          : <hr
              style={{
                color: "white",
                backgroundColor: "white",
                height: 4,
                marginTop: -4,
              }}
            />
        }
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
