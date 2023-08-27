import React, { ReactNode, useState } from 'react';

import { BoxProps } from '@react-bulk/core';
import { Box, Card, Collapse, Divider, Text } from '@react-bulk/web';

import Title from './Title';

export type PanelProps = {
  title: ReactNode;
  initialExpanded?: boolean;
  children: ReactNode;
} & BoxProps;

export default function Panel({ title, initialExpanded = true, children, ...rest }: PanelProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <Card pb={0} {...rest}>
      <Box row noWrap p={4} m={-4} mb={0} onPress={() => setExpanded((current) => !current)}>
        <Title flex>{title}</Title>
        <Text>{expanded ? '▲' : '▼'}</Text>
      </Box>

      <Box mx={-4}>
        <Collapse in={expanded} px={4} pb={4}>
          <Divider mx={-4} mb={4} />
          {children}
        </Collapse>
      </Box>
    </Card>
  );
}
