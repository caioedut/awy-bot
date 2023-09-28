import React, { useEffect, useRef, useState } from 'react';

import { Box, Text, useTheme } from '@react-bulk/web';
import electron from 'electron';

const ipcRenderer = electron.ipcRenderer;

type OverlayType = {
  Default: object;
  Lock: object;
  Loop: object;
  Actions: object;
};

function debug(value) {
  alert(JSON.stringify(value, null, 2));
}

export default function Overlay() {
  const theme = useTheme();

  const contentRef = useRef(null);
  const [overlays, setOverlays] = useState<OverlayType>({} as OverlayType);

  const spacing = 2;

  useEffect(() => {
    const interval = setInterval(() => {
      const data = { type: 'get' };
      const response = ipcRenderer.sendSync('overlay', JSON.stringify(data));
      setOverlays(JSON.parse(response || '{}'));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const pad = theme.spacing(spacing * 2);
    const width = contentRef.current.clientWidth + pad;
    const height = contentRef.current.clientHeight + pad;

    const data = `${width}|${height}`;
    ipcRenderer.sendSync('overlay-resize', data);
  }, [overlays]);

  // Sort by keys
  const { Default = {} as any, Lock = {}, Actions = {}, Loop = {}, ...rest } = overlays;

  if (!Object.values(Default).length) {
    Default.Running = 1;
  }

  const sections = Object.entries({ Default, Lock, Actions, Loop, ...rest });

  return (
    <Box
      style={{
        p: spacing,
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      <Box ref={contentRef} align="start">
        {sections
          .filter(([, configs]) => Object.values(configs).length)
          .map(([title, configs = {}], index) => (
            <React.Fragment key={title}>
              <Text color="primary" bold mt={index ? 2 : 0} numberOfLines={1}>
                {title === 'Default' ? 'Awy Bot' : title}
              </Text>

              {Object.entries(configs).map(([label, value]: [label: string, value: any]) => (
                <Text key={label} mt={0.5} numberOfLines={1}>
                  {label} {[0, 1, '0', '1', true, false, 'true', 'false'].includes(value) ? '' : value || ''}
                </Text>
              ))}
            </React.Fragment>
          ))}
      </Box>
    </Box>
  );
}
