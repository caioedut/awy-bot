import React, { useEffect, useRef, useState } from 'react';

import electron from 'electron';
import { setInterval } from 'timers';

import Box from '@mui/material/Box';

const ipcRenderer = electron.ipcRenderer;

type OverlayType = {
  Default: object;
  Lock: object;
  Loop: object;
  Actions: object;
};

export default function Overlay() {
  const contentRef = useRef(null);
  const [overlays, setOverlays] = useState<OverlayType>({} as OverlayType);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = { type: 'get' };
      const response = ipcRenderer.sendSync('overlay', JSON.stringify(data));
      setOverlays(JSON.parse(response || '{}'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pad = 8 * 2;
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
      sx={{
        p: 1,
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      <Box ref={contentRef} sx={{ display: 'inline-block' }}>
        <Line color="primary.main">
          <b>Awy Bot</b>
        </Line>

        {sections.map(
          ([title, configs = {}]) =>
            Object.values(configs).length > 0 && (
              <React.Fragment key={title}>
                {title !== 'Default' && (
                  <Line color="primary.main" mt={0.5}>
                    <b>{title}</b>
                  </Line>
                )}
                {Object.entries(configs).map(([label]) => (
                  <Item key={label} label={title === 'Default' ? label : <kbd>{label}</kbd>} />
                ))}
              </React.Fragment>
            ),
        )}
      </Box>
    </Box>
  );
}

const Line = (props) => (
  <>
    <Box {...props} sx={{ display: 'inline-block', whiteSpace: 'nowrap' }} />
    <br />
  </>
);

const Item = (props: { label: any; color?: string }) => {
  const { label, color = 'success.main' } = props;
  return <Line color={color}>{label}</Line>;
};
