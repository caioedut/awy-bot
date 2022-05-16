import React from 'react';
import Grid, { GridProps } from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Content from '../Content';

function Section(props: GridProps & { title: string }) {
  const { title, children, ...rest } = props;

  return (
    <Box mt={2}>
      <Typography variant="h6">{title}</Typography>
      <Content paper mt={1}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between" {...rest}>
          {children}
        </Grid>
      </Content>
    </Box>
  );
}

export default Section;
