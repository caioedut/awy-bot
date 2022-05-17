import React from 'react';
import Grid, { GridProps } from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Content from '../Content';

function Section(props: GridProps & { grid?: boolean; title: string }) {
  const { title, children, grid = true, ...rest } = props;

  return (
    <Box mt={2}>
      <Typography variant="h6">{title}</Typography>
      <Content paper mt={1}>
        {grid ? (
          <Grid container spacing={2} alignItems="center" justifyContent="space-between" {...rest}>
            {children}
          </Grid>
        ) : (
          children
        )}
      </Content>
    </Box>
  );
}

export default Section;
