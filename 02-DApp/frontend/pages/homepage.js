import Image from "next/image";
import Link from "next/link";
import cardAndPack from "../assets/images/card_and_pack.png";
import bootstrap from "../styles/sass/custom_bootstrap.module.scss";
import styles from "../styles/sass/home_styles.module.scss";

export default function Homepage() {
  return (
    <div className={styles.homepage}>
      <div className={bootstrap.homepagebs}>
        <div
          className={[
            bootstrap.container,
            bootstrap["mt-5"],
            bootstrap["mb-7"],
          ].join(" ")}
        >
          <div
            className={[
              bootstrap.row,
              bootstrap["justify-content-evenly"],
              bootstrap["mb-5"],
            ].join(" ")}
          >
            <div
              className={[
                bootstrap["col-md"],
                bootstrap["text-center"],
                bootstrap["text-md-start"],
              ].join(" ")}
            >
              <h1
                className={[bootstrap["display-1"], bootstrap["fw-bold"]].join(
                  " "
                )}
              >
                Build Yours.
              </h1>
              <h1
                className={[bootstrap["display-1"], styles["fw-900"]].join(" ")}
              >
                Compete with Friends.
              </h1>
              <div
                className={[
                  bootstrap["mt-4"],
                  bootstrap["me-4"],
                  bootstrap["mb-sm-4"],
                ].join(" ")}
              >
                <p className={bootstrap["fs-5"]}>
                  {" "}
                  The future of fantasy esports, on the blockchain. Mint a free
                  TeamDiff starter pack now to unlock five LCS trading cards.
                  Build your card collection and dream roster, then join a
                  fantasy league and compete against your friends for USDC
                  tokens.{" "}
                </p>
              </div>
              <div
                className={[
                  bootstrap["mt-5"],
                  bootstrap["d-none"],
                  bootstrap["d-md-inline"],
                ].join(" ")}
              >
                <Link href="/mintHome">
                  <button
                    className={[
                      bootstrap.btn,
                      bootstrap["btn-primary"],
                      bootstrap["fs-5"],
                      bootstrap["pe-5"],
                      bootstrap["ps-5"],
                      bootstrap["fw-bold"],
                    ].join(" ")}
                  >
                    Mint Starter Pack
                  </button>
                </Link>
              </div>
            </div>
            <div
              className={[bootstrap["col-md"], bootstrap["text-center"]].join(
                " "
              )}
            >
              <Image
                src={cardAndPack}
                alt="MVP Card"
                className={[bootstrap["img-fluid"], styles.cardAndPack].join(
                  " "
                )}
              />
            </div>
            <div
              className={[
                bootstrap["mt-4"],
                bootstrap["d-inline"],
                bootstrap["d-md-none"],
                bootstrap["text-center"],
              ].join(" ")}
            >
              <Link href="/mintHome">
                <button
                  className={[
                    bootstrap.btn,
                    bootstrap["btn-primary"],
                    bootstrap["fs-5"],
                    bootstrap["pe-5"],
                    bootstrap["ps-5"],
                    bootstrap["fw-bold"],
                  ].join(" ")}
                >
                  Mint Starter Pack
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles["bg-how-it-works"]}>
          <div
            className={[
              bootstrap.container,
              bootstrap["pt-5"],
              bootstrap["pb-4"],
            ].join(" ")}
          >
            <div className={[bootstrap.row, bootstrap["mb-4"]].join(" ")}>
              <div
                className={[
                  bootstrap["col-lg"],
                  bootstrap["ps-4"],
                  bootstrap["mb-3"],
                  bootstrap["pe-4"],
                  bootstrap["m-lg-3"],
                ].join(" ")}
              >
                <h1
                  className={[bootstrap["fw-bold"], bootstrap["mt-4"]].join(
                    " "
                  )}
                >
                  How it Works
                </h1>
              </div>
              <div
                className={[
                  bootstrap["col-lg"],
                  bootstrap["ps-4"],
                  bootstrap["mb-3"],
                  bootstrap["pe-4"],
                  bootstrap["m-lg-3"],
                ].join(" ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  fill="currentColor"
                  className={[
                    bootstrap.bi,
                    bootstrap["bi-collection-fill"],
                    styles["hiw-icon"],
                  ].join(" ")}
                  viewBox="0 0 16 16"
                >
                  <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z" />
                </svg>
                <h3>Build a Super Team</h3>
                <p className={bootstrap["fs-5"]}>
                  Mint your free starter pack to reveal 5 athlete NFT trading
                  cards.
                </p>
              </div>
              <div
                className={[
                  bootstrap["col-lg"],
                  bootstrap["ps-4"],
                  bootstrap["mb-3"],
                  bootstrap["pe-4"],
                  bootstrap["m-lg-3"],
                ].join(" ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  fill="currentColor"
                  className={[
                    bootstrap.bi,
                    bootstrap["bi-joystick"],
                    styles["hiw-icon"],
                  ].join(" ")}
                  viewBox="0 0 16 16"
                >
                  <path d="M10 2a2 2 0 0 1-1.5 1.937v5.087c.863.083 1.5.377 1.5.726 0 .414-.895.75-2 .75s-2-.336-2-.75c0-.35.637-.643 1.5-.726V3.937A2 2 0 1 1 10 2z" />
                  <path d="M0 9.665v1.717a1 1 0 0 0 .553.894l6.553 3.277a2 2 0 0 0 1.788 0l6.553-3.277a1 1 0 0 0 .553-.894V9.665c0-.1-.06-.19-.152-.23L9.5 6.715v.993l5.227 2.178a.125.125 0 0 1 .001.23l-5.94 2.546a2 2 0 0 1-1.576 0l-5.94-2.546a.125.125 0 0 1 .001-.23L6.5 7.708l-.013-.988L.152 9.435a.25.25 0 0 0-.152.23z" />
                </svg>
                <h3>Create a League</h3>
                <p className={bootstrap["fs-5"]}>
                  Create or join leagues to challenge your friends to fantasy,
                  on-chain and decentralized.
                </p>
              </div>
              <div
                className={[
                  bootstrap["col-lg"],
                  bootstrap["ps-4"],
                  bootstrap["mb-3"],
                  bootstrap["pe-4"],
                  bootstrap["m-lg-3"],
                ].join(" ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  fill="currentColor"
                  className={[
                    bootstrap.bi,
                    bootstrap["bi-coin"],
                    styles["hiw-icon"],
                  ].join(" ")}
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z" />
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                </svg>
                <h3>Win Tokens</h3>
                <p className={bootstrap["fs-5"]}>
                  Go head-to-head against 7 other players weekly for a chance to
                  win pooled tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={[styles["bg-second-cta"], bootstrap["pb-3"]].join(" ")}>
          <div className={bootstrap.container}>
            <div className={styles["second-cta"]}>
              {/* <h2
                className={[bootstrap["display-3"], bootstrap["fw-bold"]].join(
                  " "
                )}
              >
                Create a League
              </h2>
              <p className={[bootstrap["fs-5"], bootstrap["mt-3"]].join(" ")}>
                Minting and opening your player card packs was only the first
                step. Now, it's time to put them to use. Create or join a
                fantasy league to compete to win tokens for the League of
                Legends LCS Summer Split of 2022 and create your TeamDiff.
              </p>
              <Link href="/createLeague">
                <button
                  className={[
                    bootstrap["btn"],
                    bootstrap["btn-outline-secondary"],
                    bootstrap["fs-5"],
                    bootstrap["pe-5"],
                    bootstrap["ps-5"],
                    bootstrap["mt-3"],
                    bootstrap["fw-bold"],
                  ].join(" ")}
                >
                  Create League
                </button>
              </Link> */}
              <h2
                className={[bootstrap["display-3"], bootstrap["fw-bold"]].join(
                  " "
                )}
              >
                Open your Pack
              </h2>
              <p className={[bootstrap["fs-5"], bootstrap["mt-3"]].join(" ")}>
                Minting a starterpack is only the first step of your TeamDiff
                journey. Inside the pack is five trading cards of LCS atheletes!
                Open the pack (which will burn it in the process) to unlock five
                athletes and begin to build your collection!
              </p>
              <Link href="/burnPack">
                <button
                  className={[
                    bootstrap.btn,
                    bootstrap["btn-outline-secondary"],
                    bootstrap["fs-5"],
                    bootstrap["pe-5"],
                    bootstrap["ps-5"],
                    bootstrap["mt-3"],
                    bootstrap["fw-bold"],
                  ].join(" ")}
                >
                  Coming Very Soon
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
