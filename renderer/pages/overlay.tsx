import { useEffect, useRef, useState } from 'react';

import electron from 'electron';
import { setInterval } from 'timers';

import Box from '@mui/material/Box';

const ipcRenderer = electron.ipcRenderer;

type OverlayType = {
  Paused: string;
  Focused: string;
};

export default function Overlay() {
  const contentRef = useRef(null);
  const [config, setConfig] = useState<OverlayType>({} as OverlayType);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = { type: 'get' };
      const response = ipcRenderer.sendSync('overlay', JSON.stringify(data));
      setConfig(JSON.parse(response || '{}'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pad = 8 * 2;
    const width = contentRef.current.clientWidth + pad;
    const height = contentRef.current.clientHeight + pad;

    const data = `${width}|${height}`;
    ipcRenderer.sendSync('overlay-resize', data);
  }, [config]);

  const entries = Object.entries(config);

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
        <Line>Awy Bot</Line>
        {!entries.length && <Line color="success.main">Running</Line>}
        {entries.map(([label, value]) => (
          <Item label={label} value={value} />
        ))}
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

const Item = (props: { label: string; value?: string }) => {
  const { label, value } = props;

  const color = Number(value) ? 'success.main' : 'error.main';

  if (!Number(value)) {
    return null;
  }

  return <Line color={color}>{label}</Line>;
};
