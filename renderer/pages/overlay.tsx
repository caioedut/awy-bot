import { useEffect, useState } from 'react';

import electron from 'electron';
import { setInterval } from 'timers';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const ipcRenderer = electron.ipcRenderer;

type OverlayType = {
  Paused: string;
  Focused: string;
};

export default function Overlay() {
  const [config, setConfig] = useState<OverlayType>({} as OverlayType);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = { type: 'get' };
      const response = ipcRenderer.sendSync('overlay', JSON.stringify(data));
      setConfig(JSON.parse(response));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        border: '10px solid red',
        '-webkit-user-select': 'none',
        '-webkit-app-region': 'drag',
        'user-select': 'none',
      }}
    >
      <Grid container>
        {Object.entries(config).map(([label, value]) => (
          <Item label={label} value={value} />
        ))}
      </Grid>
    </Box>
  );
}

const Item = (props: { label: string; value?: string }) => {
  const { label, value } = props;

  const color = Number(value) ? 'success.main' : 'error.main';

  if (!Number(value)) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <Box component="b" color={color}>
        {label}
      </Box>
    </Grid>
  );
};
