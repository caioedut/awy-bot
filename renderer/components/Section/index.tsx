import React from 'react';

import Box from '@mui/material/Box';
import Grid, { GridProps } from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Content from '../Content';

function Section(props: GridProps & { noGrid?: boolean; title: string }) {
  const { title, children, noGrid, ...rest } = props;

  return (
    <Box mt={2}>
      <Typography variant="h6">{title}</Typography>
      <Content paper mt={1}>
        {noGrid ? (
          children
        ) : (
          <Grid container spacing={1} alignItems="center" justifyContent="space-between" {...rest}>
            {children}
          </Grid>
        )}
      </Content>
    </Box>
  );
}

export default Section;
