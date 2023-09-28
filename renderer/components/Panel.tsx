import React, { ReactNode, useState } from 'react';

import { BoxProps } from '@react-bulk/core';
import { Box, Card, Collapse, Divider, Text, useTheme } from '@react-bulk/web';

import Title from './Title';

export type PanelProps = {
  title: ReactNode;
  initialExpanded?: boolean;
  children: ReactNode;
} & BoxProps;

export default function Panel({ title, initialExpanded = true, children, ...rest }: PanelProps) {
  const theme = useTheme();
  const { gap } = theme.shape;

  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <Card p={0} overflow="hidden" {...rest}>
      <Box row noWrap p={gap} onPress={() => setExpanded((current) => !current)}>
        <Title flex>{title}</Title>
        <Text>{expanded ? '▲' : '▼'}</Text>
      </Box>

      <Collapse visible={expanded}>
        <Divider />
        <Box p={gap}>{children}</Box>
      </Collapse>
    </Card>
  );
}
