import React from "react";
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
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

  // console.log(isMobile);
  return (
    <>
      <Box component="div" height="100%" backgroundColor="primary.dark">
        <Box component="body" height="100vh" backgroundColor="primary.dark">
          
          {isMobile? 
            <div>
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
              <Image src={logo} alt="TeamDiff logo" width="200px" height="50px"/>
              <WalletLogin isMobile={isMobile}/>
            </Box>
            <Box
            sx={{display: "flex", m: 1}}>
            {pages.map((page) => (
              <NavLink key={page.name} href={page.href} isMobile={isMobile}>
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
            </div>
          : 
          <div>
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
            <Container>
            <Link href="/"> 
              <a>
                <Image src={logo} alt="TeamDiff logo" width="300px" height="75px"/>
              </a>
            </Link>
            </Container>
            {pages.map((page) => (
              <NavLink key={page.name} href={page.href} isMobile={isMobile}>
                {page.name}
              </NavLink>
            ))}
            <WalletLogin isMobile={isMobile}/>
          </Box>
          <hr
              style={{
                color: "white",
                backgroundColor: "white",
                height: 4,
                marginTop: -4,
              }}
          />
          </div>
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
