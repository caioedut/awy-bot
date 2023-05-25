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
      <Box row noWrap p={3} m={-3} mb={0} onPress={() => setExpanded((current) => !current)}>
        <Title flex>{title}</Title>
        <Text>{expanded ? '▲' : '▼'}</Text>
      </Box>

      <Box mx={-3}>
        <Collapse in={expanded} px={3} pb={3}>
          <Divider mx={-3} mb={3} />
          {children}
        </Collapse>
      </Box>
    </Card>
  );
}
