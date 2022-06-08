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
<<<<<<< HEAD
<<<<<<< HEAD
                    marginRight: "10px",
=======
                    marginLeft: "10px",
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
                    marginRight: "10px",
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
                    textDecorationColor: "cyan",
                    textUnderlineOffset: "10px",
                  }
                : {
                    color: "white",
                    fontSize: "18px",
                    textDecoration: "none",
                    fontFamily: "Exo",
<<<<<<< HEAD
<<<<<<< HEAD
                    marginRight: "10px",
=======
                    marginLeft: "10px",
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
                    marginRight: "10px",
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
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
<<<<<<< HEAD
<<<<<<< HEAD
                    marginRight: "10px",
=======
                    marginRight: "15px",
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
                    marginRight: "10px",
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
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
