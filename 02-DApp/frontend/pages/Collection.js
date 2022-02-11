import React from "react";
import styles from "../styles/Home.module.css";
// import example from "../public/assets/images/example.png"
// const example = require('../assets/images/example.png')
import example from '../assets/images/example.png'

export default function Collection() {
    console.log(example)
    return (
        <main className={styles.pages}>
            <h1 className="titles">Your collection</h1>
            {/* <img src={example} alt="Example" /> */}
            <img src="/example.png" alt="collection" style={{height: 500, width: 300 }} />
        </main>
    );
}