import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function NavLink({ className, href, children, isMobile }) {
  const router = useRouter();
  return (
    <div>
      {isMobile && (
        <Link href={href} passHref>
          <a
            style={
              router.pathname === href
                ? {
                    color: "white",
                    fontSize: "18px",
                    textDecoration: "underline",
                    fontFamily: "Exo",
                    marginLeft: "10px",
                    textDecorationColor: "cyan",
                    textUnderlineOffset: "10px",
                  }
                : {
                    color: "white",
                    fontSize: "18px",
                    textDecoration: "none",
                    fontFamily: "Exo",
                    marginLeft: "10px",
                  }
            }
          >
            {children}
          </a>
        </Link>
      )}
      {!isMobile && (
        <Link href={href} passHref>
          <a
            style={
              router.pathname === href
                ? {
                    color: "white",
                    fontSize: "24px",
                    textDecoration: "underline",
                    fontFamily: "Exo",
                    marginRight: "10px",
                    textDecorationColor: "cyan",
                    textUnderlineOffset: "10px",
                  }
                : {
                    color: "white",
                    fontSize: "24px",
                    textDecoration: "none",
                    fontFamily: "Exo",
                    marginRight: "15px",
                  }
            }
          >
            {children}
          </a>
        </Link>
      )}
    </div>
  );
}
