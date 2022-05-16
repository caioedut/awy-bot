import React from 'react';
import Head from 'next/head';
import Content from '../components/Content';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Hotkey from '../components/Hotkey';

function Home() {
  const handleChange = (e) => {
    fetch('/api/mouse');
  };

  return (
    <React.Fragment>
      <Head>
        <title>Awy Bot</title>
      </Head>

      <Typography variant="h6">Mouse</Typography>
      <Content paper>
        <Grid container>
          <Grid item>Middle Button</Grid>
          <Grid item>
            <Hotkey onChange={handleChange} />
          </Grid>
        </Grid>
      </Content>
    </React.Fragment>
  );
}

export default Home;
