import React, { useEffect, useMemo, useRef, useState } from 'react';

import electron from 'electron';
import Head from 'next/head';

import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Hotkey from '../components/Hotkey';
import Section from '../components/Section';
import Storage from '../providers/storage';

const ipcRenderer = electron.ipcRenderer;

const defaults = [
  { group: 'mouse', key: 'MButton', sequence: [], name: 'Mouse Middle' },
  { group: 'mouse', key: 'XButton1', sequence: [], name: 'Mouse X1' },
  { group: 'mouse', key: 'XButton2', sequence: [], name: 'Mouse X2' },
];

type Window = {
  title: string;
  ahk_id: string;
};

type Binding = {
  key: string;
  sequence: string[];
  name?: string;
  group?: string;
  loop?: boolean;
};

function Home() {
  const formRef = useRef(null);
  const theme = useTheme();

  // Load/save configs
  const [settings] = useState([1, 2, 3, 4, 5, 7, 8, 9, 10]);
  const [config, setConfig] = useState(settings[0]);
  const store = useMemo(() => Storage.with(config), [config]);

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Models
  const [window, setWindow] = useState('');
  const [bindings, setBindings] = useState<Binding[]>([]);

  if (!bindings.find((item) => !item?.key && !item?.sequence?.length)) {
    bindings.push({ key: '', sequence: [] });
  }

  useEffect(() => {
    const response = ipcRenderer.sendSync('windows');
    const data = JSON.parse(response);

    setVisibleWindows(
      data.map((item) => {
        const split = item.split('|');
        const ahk_id = split.shift();
        const title = split.filter(Boolean).join('|');

        return { ahk_id, title };
      }),
    );
  }, []);

  useEffect(() => {
    setBindings(store.get('bindings', defaults) as Binding[]);
  }, [store]);

  useEffect(() => {
    store.set('bindings', bindings);
    const data = window && bindings ? { window, bindings } : {};
    ipcRenderer.sendSync('remap', JSON.stringify(data));
  }, [window, bindings]);

  const getSequence = (index) => {
    return (bindings[index].sequence = [
      formRef.current[`${index}.sequence.0`]?.value,
      formRef.current[`${index}.sequence.1`]?.value,
      formRef.current[`${index}.sequence.2`]?.value,
    ].filter(Boolean));
  };

  const getData = (index) => {
    return {
      key: formRef.current[`${index}.key`]?.value,
      sequence: getSequence(index),
      loop: Boolean(formRef.current[`${index}.loop`]?.checked),
    };
  };

  const handleChangeWindow = (e: SelectChangeEvent) => {
    setWindow(e.target.value as string);
  };

  const handleChangeConfig = (e: React.MouseEvent<HTMLElement>, value: number) => {
    setConfig(value || config);
  };

  const handleChangeMouse = (index) => {
    bindings[index].sequence = getSequence(index);
    setBindings([...bindings]);
  };

  const handleDelete = (index) => {
    const newBindings = [...bindings];
    newBindings.splice(index, 1);
    setBindings(newBindings);
  };

  const handleChangeBinding = (index) => {
    const data = getData(index);

    const newBindings = [...bindings];
    newBindings[index] = data;

    if (!data.key && !data.sequence.length) {
      newBindings.splice(index, 1);
    }

    setBindings(newBindings);
  };

  return (
    <React.Fragment>
      <Head>
        <title>Awy Bot</title>
      </Head>

      <form ref={formRef}>
        <Box mt={2}>
          <Section title="Application">
            <Grid item xs={3}>
              <Typography variant="body2">
                <b>Window</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Select value={window ?? ''} onChange={handleChangeWindow} autoFocus>
                {[{ title: '[Select]', ahk_id: '' }, ...visibleWindows].map((win, index) => (
                  <MenuItem key={index} value={win.ahk_id}>
                    {win.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item>
              <Tooltip title="Refresh">
                <IconButton>
                  <RefreshIcon color="primary" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Box width="100%" />
            <Grid item xs={3}>
              <Typography variant="body2">
                <b>Settings</b>
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <ToggleButtonGroup exclusive value={config} size="small" color="primary" onChange={handleChangeConfig}>
                {settings.map((item) => (
                  <ToggleButton key={item} value={item}>
                    <Box my={-0.2} fontSize={14} width={37.2}>
                      {item}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Section>
        </Box>

        <Box mt={2}>
          <Section title="Mouse">
            {bindings.map(
              (item, index) =>
                item.group === 'mouse' && (
                  <React.Fragment key={item.key}>
                    <Grid item xs={2}>
                      <Typography variant="body2">
                        <b>{item.name}</b>
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      Remap:
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.0`}
                        value={item.sequence?.[0] ?? ''}
                        label="Key 1"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.1`}
                        value={item.sequence?.[1] ?? ''}
                        label="Key 2"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.2`}
                        value={item.sequence?.[2] ?? ''}
                        label="Key 3"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} />
                  </React.Fragment>
                ),
            )}
          </Section>
        </Box>

        <Box mt={2}>
          <Section title="Keyboard">
            <Grid item xs={12} />
            {bindings.map(
              (item, index) =>
                item.group !== 'mouse' && (
                  <React.Fragment key={index}>
                    <Grid item xs={2} sx={{ position: 'relative' }}>
                      <Tooltip title="Delete">
                        <IconButton sx={{ position: 'absolute', top: 18, left: -16 }} onClick={() => handleDelete(index)}>
                          <DeleteIcon color="primary" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Hotkey
                        name={`${index}.key`}
                        value={item.key ?? ''}
                        label="Trigger key"
                        onChange={() => handleChangeBinding(index)}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <FormControlLabel
                        label="Loop"
                        control={
                          <Box
                            component="input"
                            type="checkbox"
                            name={`${index}.loop`}
                            checked={item.loop ?? false}
                            disabled={!item.key}
                            onChange={() => handleChangeBinding(index)}
                            sx={{
                              mx: 1,
                              height: 16,
                              width: 16,
                              accentColor: theme.palette.primary.main,
                            }}
                          ></Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.0`}
                        value={item.sequence?.[0] ?? ''}
                        label="Key 1"
                        onChange={() => handleChangeBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.1`}
                        value={item.sequence?.[1] ?? ''}
                        label="Key 2"
                        onChange={() => handleChangeBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.2`}
                        value={item.sequence?.[2] ?? ''}
                        label="Key 3"
                        onChange={() => handleChangeBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} />
                  </React.Fragment>
                ),
            )}
          </Section>
        </Box>
      </form>
    </React.Fragment>
  );
}

export default Home;
