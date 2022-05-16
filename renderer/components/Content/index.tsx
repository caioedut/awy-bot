import React from 'react';

import Box, { BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type Props = {
  paper?: boolean;
  container?: boolean;
};

function Content(props: BoxProps & Props) {
  const { children, paper, container, ...rest } = props;

  return (
    <Box //
      component={paper ? Paper : 'div'}
      maxWidth={container ? 1024 : undefined}
      p={paper || container ? 2 : 0}
      mx="auto"
      {...rest}
    >
      {children}
    </Box>
  );
}

export default Content;
