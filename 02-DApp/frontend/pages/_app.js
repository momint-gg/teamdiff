import React from 'react'
import Head from "next/head";
import theme from '../styles/theme'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
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
