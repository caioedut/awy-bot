import React from 'react';

import ReactBulk from '@react-bulk/core';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.css';

import theme from '../themes/default';

export default function (props: AppProps & { Component: any }) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ReactBulk theme={theme}>
        <Component {...pageProps} />
      </ReactBulk>
    </React.Fragment>
  );
}
