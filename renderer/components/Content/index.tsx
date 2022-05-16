import React from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type Props = {
  paper?: boolean;
  container?: boolean;
  children: JSX.Element;
};

function Content({ children, paper, container, ...rest }: Props) {
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
