import "bootstrap/dist/css/bootstrap.css";
import { Container, Box, Typography, Fab, Link } from "@mui/material";
import Image from "next/image";
import card_and_pack from "../assets/images/card_and_pack.png";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";

export default function MintHome() {
  const router = useRouter();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  return (
    <Box>

      <Box>
        {isMobile ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  textAlign: "center"
                }}
              >
                <Box
                  sx={{
                    flex: 2,
                  }}
                >
                  <Typography variant="h4" color="primary" component="div">
                    Starter Pack
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={card_and_pack}
                      alt="Picture of the author"
                      width="550px"
                      height="550px"
                    />
                  </Box>
                  <Typography color="primary" component="div">
                    Mint a starter pack and get 5 unique athlete NFTs, which
                    allow you to build a roster and get right into the action.
                  </Typography>
                  <Box>
                    <Fab
                      variant="extended"
                      size="large"
                      aria-label="add"
                      onClick={() => router.push("./mintPack")}
                      sx={{
                        marginTop: 5,
                        marginRight: 1,
                        background:
                          "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                        color: "white",
                        fontSize: 20,
                        paddingRight: 6,
                        paddingLeft: 6
                      }}
                    >
                      Mint
                    </Fab>
                    <Fab
                      variant="extended"
                      size="large"
                      color="white"
                      aria-label="add"
                      onClick={() => router.push("./starterPackContents")}
                      sx={{ marginTop: 3, fontSize: 20 }}
                    >
                      CONTENTS
                    </Fab>
                    <Box sx={{ marginTop: 3 }}>
                      <Typography variant="h6" color="primary" component="div">
                        Don't know how to mint? Check out this
                        <Link sx={{ marginLeft: 1 }}>
                          <a target="_blank" href="https://mirror.xyz/teamdiff.eth/tK9LpoqKvuXbFqTH5HjlL1d-4VO8wO8XfmOG_WaFN64">
                            guide
                          </a>
                        </Link>!
                      </Typography>
                    </Box>
                    <Fab
                      variant="extended"
                      size="medium"
                      aria-label="add"
                      onClick={() => router.push("./terms-of-service")}
                      sx={{ backgroundColor: "#c9c9c9", marginTop: 2, fontSize: 18 }}
                    >
                      Mint Terms of Service
                    </Fab>
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignContent: "space-between",
              textAlign: "center"
            }}
          >
            <Container
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h3" color="primary" component="div" sx={{ marginBottom: 3 }}>
                  Starter Pack
                </Typography>
                <Typography variant="h6" color="primary" component="div">
                  Mint a starter pack and get 5 unique athlete NFTs, which
                  allow you to build a roster and get right into the action.
                </Typography>
                {/*TODO: Only show this mint button if user is logged in*/}
                <Fab
                  variant="extended"
                  size="large"
                  aria-label="add"
                  onClick={() => router.push("./mintPack")}
                  sx={{
                    marginTop: 3,
                    marginRight: 3,
                    background:
                      "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                    color: "white",
                    fontSize: 20,
                    paddingRight: 6,
                    paddingLeft: 6
                  }}
                >
                  Mint
                </Fab>
                <Fab
                  variant="extended"
                  size="large"
                  color="white"
                  aria-label="add"
                  onClick={() => router.push("./starterPackContents")}
                  sx={{ marginTop: 3, fontSize: 20 }}
                >
                  CONTENTS
                </Fab>
                <Box sx={{ marginTop: 3 }}>
                  <Typography variant="h6" color="primary" component="div">
                    Don't know how to mint? Check out this
                    <Link sx={{ marginLeft: 1 }}>
                      <a target="_blank" href="https://mirror.xyz/teamdiff.eth/tK9LpoqKvuXbFqTH5HjlL1d-4VO8wO8XfmOG_WaFN64">
                        guide
                      </a>
                    </Link>!
                  </Typography>
                </Box>
                <Fab
                  variant="extended"
                  size="medium"
                  aria-label="add"
                  onClick={() => router.push("./terms-of-service")}
                  sx={{ backgroundColor: "#c9c9c9", marginTop: 2, fontSize: 18 }}
                >
                  Mint Terms of Service
                </Fab>
              </Box>
            </Container>
            {isMobile ? (
              <Box>
                <Image
                  src={card_and_pack}
                  alt="Picture of the author"
                  width="550px"
                  height="550px"
                />
              </Box>
            ) : (
              <Container
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Image
                    src={card_and_pack}
                    alt="Picture of the author"
                    width="550px"
                    height="550px"
                  />
                </Box>
              </Container>
            )}
          </Box>
        )}{" "}
      </Box>
    </Box>
  );
}
