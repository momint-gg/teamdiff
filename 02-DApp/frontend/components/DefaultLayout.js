import React from 'react'
import NavigationBar from "./NavigationBar";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Footer from "./Footer";

export default function DefaultLayout(props) {
    if (typeof window !== "undefined") {
        return (
            <div>
                <Head>
                    <title>Play Momint</title>
                    <meta name="description" content="Play Momint and Earn Today" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <NavigationBar />
                <main className={styles.main}>
                    {props.children}
                </main>
                <Footer/>
            </div>
        );
    }
    return null;
}