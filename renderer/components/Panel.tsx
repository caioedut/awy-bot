import React, { ReactNode, useState } from 'react';

import { BoxProps } from '@react-bulk/core';
import { Box, Card, Collapse, Divider, Text, useTheme } from '@react-bulk/web';

import Title from './Title';

export type PanelProps = {
  title: ReactNode;
  initialExpanded?: boolean;
  noCollapse?: boolean;
  children: ReactNode;
} & BoxProps;

export default function Panel({ title, initialExpanded, noCollapse, children, ...rest }: PanelProps) {
  const theme = useTheme();
  const { gap } = theme.shape;

  const [expanded, setExpanded] = useState(initialExpanded ?? false);

  return (
    <Card p={0} overflow="hidden" {...rest}>
      <Box row noWrap p={gap} onPress={() => setExpanded((current) => !current)}>
        <Title flex>{title}</Title>
        {!noCollapse && <Text>{expanded ? '▲' : '▼'}</Text>}
      </Box>

      <Collapse visible={noCollapse ? true : expanded}>
        <Divider />
        <Box p={gap}>{children}</Box>
      </Collapse>
    </Card>
  );
}
