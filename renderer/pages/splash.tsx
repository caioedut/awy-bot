import React from 'react';

import { createStyle } from '@react-bulk/core';
import { Box, Image, Loading, Text, useTheme } from '@react-bulk/web';

export default function Splash() {
  const theme = useTheme();

  createStyle({
    global: true,
    style: `
      body {
        background: linear-gradient(135deg, ${theme.color('primary.main')} 0%, ${theme.color('primary.dark')} 100%);
      }
    `,
  });

  return (
    <Box center p={3}>
      <Box>
        <Image source="images/logo.png" alt="Awy Bot" w={80} />
      </Box>
      <Text variant="h3" noWrap mt={1}>
        Awy Bot
      </Text>
      <Box row noWrap center mt={3}>
        <Loading color="white" size={0.5} />
        <Text italic ml={2}>
          Loading resources...
        </Text>
      </Box>
    </Box>
  );
}
