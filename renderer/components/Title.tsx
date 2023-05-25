import React from 'react';

import { TextProps } from '@react-bulk/core';
import { Text } from '@react-bulk/web';

export default function Title(props: TextProps) {
  return <Text variant="subtitle" color="secondary" bold letterSpacing={1.5} {...props} />;
}
