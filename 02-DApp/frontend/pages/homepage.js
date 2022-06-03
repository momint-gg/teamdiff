import bootstrap from '../styles/sass/custom_bootstrap.module.scss';
import styles from '../styles/sass/home_styles.module.scss';
import cardAndPack from '../assets/images/card_and_pack.png';
import Image from "next/image";

// TODO: Rework buttons
// TODO: Mobile no container
// TODO: Mobile fix button wording

export default function Homepage() {
    return (
        <div className={styles.homepage}>
            <div className={bootstrap.homepagebs}>
                <div className={bootstrap.container}>
                    <div className={[bootstrap.container, bootstrap['mt-5'], bootstrap['mb-7']].join(' ')}>
                        <div className={[bootstrap.row, bootstrap['justify-content-evenly'], bootstrap['mb-5']].join(' ')}>
                            <div className={[bootstrap["col-md"], bootstrap["text-center"], bootstrap["text-md-start"]].join(' ')}>
                                <h1 className={[bootstrap["display-1"], bootstrap["fw-bold"]].join(' ')}>Build Yours.</h1>
                                <h1 className={[bootstrap["display-1"], styles["fw-900"]].join(' ')}>Compete with Friends.</h1>
                                <div className={[bootstrap["mt-4"], bootstrap["me-4"], bootstrap["mb-sm-4"]].join(' ')}>
                                    <p className={bootstrap["fs-5"]}>Build up your collection of TeamDiff Genesis cards to enter fantasy esports
                                        leagues and compete against your friends. We’re
                                        building the future of fantasy esports, on the blockchain. Sign up for a chance to get a
                                        whitelist spot to mint a pack.</p>
                                </div>
                                <div className={[bootstrap["mt-5"], bootstrap["d-none"], bootstrap["d-md-inline"]].join(' ')}>
                                    <button className={[bootstrap["btn"], bootstrap["btn-primary"], bootstrap["fs-5"], bootstrap["pe-5"], bootstrap["ps-5"], bootstrap["fw-bold"]].join(' ')} data-tf-popup="COVWWEaX"
                                        data-tf-iframe-props="title=Registration Form" data-tf-medium="snippet">
                                        Sign Up for Early Access
                                    </button>
                                </div>
                            </div>
                            <div className={[bootstrap["col-md"], bootstrap["text-center"]].join(' ')}>
                                <Image src={cardAndPack} alt="MVP Card" className={bootstrap["img-fluid"]} />
                            </div>
                            <div className={[bootstrap["mt-4"], bootstrap["d-inline"], bootstrap["d-md-none"], bootstrap["text-center"]].join(' ')}>
                                <button className={[bootstrap["btn"], bootstrap["btn-primary"], bootstrap["fs-5"], bootstrap["pe-5"], bootstrap["ps-5"], bootstrap["fw-bold"]].join(' ')} data-tf-popup="COVWWEaX"
                                    data-tf-iframe-props="title=Registration Form" data-tf-medium="snippet">
                                    Sign Up for Early Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}