import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function Splash() {
  return (
    <Box p={2}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item>
          <Box component="img" src="images/logo.png" alt="Awy Bot" width={80} />
        </Grid>
        <Grid item xs>
          <Typography variant="h4" color="primary.main" noWrap>
            Awy Bot
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box textAlign="center" fontStyle="italic">
            <CircularProgress size={16} sx={{ mr: 1, mb: -0.3 }} />
            Loading resources...
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
