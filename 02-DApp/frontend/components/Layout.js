import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../assets/images/logo-horizontal.png";
import WalletLogin from "../components/WalletLogin";
import Footer from "./Footer";
import NavLink from "./NavLink";

const Layout = ({ children, isMobile }) => {
  const pages = [
    { name: "MY COLLECTION", href: "/collection" },
    { name: "MINT", href: "/mintHome" },
    { name: "OPEN", href: "/burnPack" },
  ];
  // const pages = [];

  return (
    // <>
    <Box
      component="body"
      minHeight="100vh"
      backgroundColor="transparent"
      sx={{
        backgroundImage:
          "url(/dots.png), linear-gradient(135deg, #330D36 0%, #110412 100%)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
      }}
    >
      {isMobile ? (
        <div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1,
              m: 1,
              borderRadius: 1,
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            <Image src={logo} alt="TeamDiff logo" width="200px" height="50px" />
            <WalletLogin isMobile={isMobile} />
          </Box>
          <Box sx={{ display: "flex", m: 1 }}>
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
      ) : (
        <div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: "row",
              p: 1,
              m: 0,
              borderRadius: 1,
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Link href="/">
                <a>
                  <Image
                    src={logo}
                    alt="TeamDiff logo"
                    width="300px"
                    height="75px"
                  />
                </a>
              </Link>
            </Box>
            {pages.map((page) => (
              <NavLink key={page.name} href={page.href} isMobile={isMobile}>
                {page.name}
              </NavLink>
            ))}
            <WalletLogin isMobile={isMobile} />
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
      )}
      <Box sx={{ paddingLeft: 5, paddingRight: 5 }}>
        <div>{children}</div>
      </Box>
      <Footer />
    </Box>
    // </>
  );
};

export default Layout;
