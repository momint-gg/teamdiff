import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavLink({ className, href, children, isMobile }) {
  const router = useRouter();
  return (
    <div>
    {isMobile &&
    <Link href={href} passHref>
      <a
        style={
          router.pathname === href
            ? {
                color: "white",
                fontSize: "20px",
                textDecoration: "underline",
                fontFamily: "Exo",
                marginRight: "10px",
                marginLeft: "10px",
                textDecorationColor: "cyan",
                textUnderlineOffset: "10px",
              }
            : {
                color: "white",
                fontSize: "20px",
                textDecoration: "none",
                fontFamily: "Exo",
                marginRight: "10px",
                marginLeft: "10px",
              }
        }
      >
        {children}
      </a>
    </Link>
  }
  {!isMobile &&
    <Link href={href} passHref>
      <a
        style={
          router.pathname === href
            ? {
                color: "white",
                fontSize: "40px",
                textDecoration: "underline",
                fontFamily: "Exo",
                marginRight: "1%",
                marginLeft: "1%",
                textDecorationColor: "cyan",
                textUnderlineOffset: "10px",
              }
            : {
                color: "white",
                fontSize: "40px",
                textDecoration: "none",
                fontFamily: "Exo",
                marginRight: "1%",
                marginLeft: "1%",
              }
        }
      >
        {children}
      </a>
    </Link>
   }
   </div>
  );
}
