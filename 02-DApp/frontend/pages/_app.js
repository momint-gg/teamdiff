import React from 'react'
import Head from "next/head";
import theme from '../styles/theme'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
//@import url('https://fonts.googleapis.com/css?family=Exo+2');
import "@fontsource/exo";
import '../styles/globalStyles.css';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Exo+2" />

      <Head>
      <title>Play TeamDiff</title>
      <meta name="description" content="Play TeamDiff and Earn Today" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp
