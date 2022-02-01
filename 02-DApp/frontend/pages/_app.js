import '../styles/globals.css'
import React from 'react'
import NavigationBar from '../components/NavigationBar';
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
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
            </main>
            <Footer/>
        </div>
    );
}
return null;
}

export default MyApp
