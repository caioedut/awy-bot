import React from 'react';

import Box, { BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function Loading(props: BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        ...props.sx,
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}
