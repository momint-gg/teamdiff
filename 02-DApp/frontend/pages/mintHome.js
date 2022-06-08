import { Box, Container, Fab, Typography } from "@mui/material";
import "bootstrap/dist/css/bootstrap.css";
import Image from "next/image";
// Router
import { useRouter } from "next/router";
import React from "react";
import { useMediaQuery } from "react-responsive";
<<<<<<< HEAD
//Router
import { useRouter } from "next/router";
=======
import cardandpack from "../assets/images/card_and_pack.png";
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625

export default function MintHome() {
  // Router
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
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <Box
                  sx={{
<<<<<<< HEAD
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <Box
                    sx={{
                      flex: 2,
                    }}
                  >
                    <Typography variant="h4" color="white" component="div">
                      Starter Pack
                    </Typography>
                    <Typography color="white" component="div">
                      Mint a starter pack and get 5 unique athlete NFTs, which
                      allow you to build a roster and get right into the action.
                    </Typography>
                    <Box>
                      <Fab
                        variant="extended"
                        size="large"
                        aria-label="add"
                        onClick={() => router.push("./mintPack")}
                        // onClick={() => setDisplayMint(true)}
                        sx={{
                          marginTop: 5,
                          marginRight: 1,
                          background:
                            "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                          color: "white",
                          fontSize: 20,
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
                        sx={{ marginTop: 5, fontSize: 20 }}
                      >
                        CONTENTS
                      </Fab>
                    </Box>
                  </Box>
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
                </Box>
              </Container>
            </Box>
          ) : (
            <Box
=======
                    flex: 2,
                  }}
                >
                  <Typography variant="h4" color="white" component="div">
                    Starter Pack
                  </Typography>
                  <Typography color="white" component="div">
                    Mint a starter pack and get 5 unique athlete NFTs, which
                    allow you to build a roster and get right into the action.
                  </Typography>
                  <Box>
                    <Fab
                      variant="extended"
                      size="large"
                      aria-label="add"
                      onClick={() => router.push("./mintPack")}
                      // onClick={() => setDisplayMint(true)}
                      sx={{
                        marginTop: 5,
                        marginRight: 1,
                        background:
                          "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                        color: "white",
                        fontSize: 20,
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
                      sx={{ marginTop: 5, fontSize: 20 }}
                    >
                      CONTENTS
                    </Fab>
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={cardandpack}
                    alt="Picture of the author"
                    width="550px"
                    height="550px"
                  />
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
            }}
          >
            <Container
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h3" color="white" component="div">
                  Starter Pack
                </Typography>
                <Typography variant="h6" color="white" component="div">
                  Mint a starter pack and get 5 unique athlete NFTs, which allow
                  you to build a roster and get right into the action.
                </Typography>
                {/* TODO: Only show this mint button if user is logged in */}
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
                  sx={{ marginTop: 5, fontSize: 20 }}
                >
                  CONTENTS
                </Fab>
              </Box>
            </Container>
            {isMobile ? (
              <Box>
                <Image
                  src={cardandpack}
                  alt="Picture of the author"
                  width="550px"
                  height="550px"
                />
              </Box>
            ) : (
              <Container
                sx={{
                  // marginLeft: "4rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
<<<<<<< HEAD
                  <Typography variant="h3" color="white" component="div">
                    Starter Pack
                  </Typography>
                  <Typography variant="h6" color="white" component="div">
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
                      marginTop: 5,
                      marginRight: 1,
                      background:
                        "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
                      color: "white",
                      fontSize: 20,
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
                    sx={{ marginTop: 5, fontSize: 20 }}
                  >
                    CONTENTS
                  </Fab>
                </Box>
              </Container>
              {isMobile ? (
                <Box>
                  <Image
                    src={card_and_pack}
=======
                  <Image
                    src={cardandpack}
                    // layout="responsive"
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
                    alt="Picture of the author"
                    width="550px"
                    height="550px"
                  />
                </Box>
<<<<<<< HEAD
              ) : (
                <Container
                  sx={{
                    // marginLeft: "4rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Image
                      src={card_and_pack}
                      // layout="responsive"
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
      )}
      {/* {displayCollection && (
        <Box>
          <StarterPackContents setDisplay={setDisplayCollection} isMobile={isMobile}/>
        </Box>
      )} */}
      {/* {displayMint && (
        <Box>
          <Box>
            <MintPack setDisplay={setDisplayMint} />
=======
              </Container>
            )}
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
          </Box>
        )}{" "}
      </Box>
    </Box>
  );
}
