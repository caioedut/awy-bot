import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import electron from 'electron';
import Head from 'next/head';

import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import ArrayHelper from '../helpers/ArrayHelper';
import TextHelper from '../helpers/TextHelper';
import useMount from '../hooks/useMount';
import Storage from '../providers/storage';

const ipcRenderer = electron.ipcRenderer;

const defaults: Binding[] = [
  // Mouse
  { group: 'mouse', key: 'MButton', sequence: [], name: 'Mouse Middle' },
  { group: 'mouse', key: 'XButton1', sequence: [], name: 'Mouse X1' },
  { group: 'mouse', key: 'XButton2', sequence: [], name: 'Mouse X2' },
  { group: 'mouse', key: 'WheelUp', sequence: [], name: 'Scroll Up' },
  { group: 'mouse', key: 'WheelDown', sequence: [], name: 'Scroll Down' },
  // Lock
  // { group: 'lock', key: 'Win', sequence: [], name: 'Windows' },
  // { group: 'lock', key: 'PrintScreen', sequence: [], name: 'Print Screen' },
  // { group: 'lock', key: 'CapsLock', sequence: [], name: 'CapsLock' },
  // { group: 'lock', key: 'ScrollLock', sequence: [], name: 'ScrollLock' },
  // { group: 'lock', key: 'NumLock', sequence: [], name: 'NumLock' },
];

const locks = [
  { key: 'Win', name: 'Windows' },
  { key: 'PrintScreen', name: 'Print Screen' },
  { key: 'NumLock', name: 'NumLock' },
  { key: 'CapsLock', name: 'CapsLock' },
  { key: 'ScrollLock', name: 'ScrollLock' },
];

type Window = {
  title: string;
  ahk_id: string;
};

type Binding = {
  key: string;
  sequence: string[];
  group: string;
  name?: string;
  loop?: boolean;
};

function Home() {
  const formRef = useRef(null);

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
    bindings.push({ group: 'keyboard', key: '', sequence: [] });
  }

  useMount(getWindows);

  useEffect(() => {
    const merged = [...(store.get('bindings', []) as Binding[]), ...defaults] as Binding[];
    setBindings(ArrayHelper.uniqueBy(merged, 'key'));
  }, [store]);

  useEffect(() => {
    store.set('bindings', bindings);
    const data = window && bindings ? { window, bindings } : {};
    ipcRenderer.sendSync('remap', JSON.stringify(data));
  }, [window, bindings]);

  function getWindows() {
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
  }

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

  const handleResetConfig = () => {
    store.clear();
    setBindings(defaults);
  };

  const handleBinding = (index) => {
    const item = bindings[index];
    const data = getData(index);

    const newBindings = [...bindings];
    newBindings[index] = { ...item, ...data } as Binding;

    if (!data.key && !data.sequence.length) {
      newBindings.splice(index, 1);
    }

    setBindings(newBindings);
  };

  const handleDelete = (index) => {
    const newBindings = [...bindings];
    newBindings.splice(index, 1);
    setBindings(newBindings);
  };

  const groups = ArrayHelper.groupBy(bindings, 'group');

  return (
    <React.Fragment>
      <Head>
        <title>Awy Bot</title>
      </Head>

      <form ref={formRef}>
        <Section title="Application">
          <Grid item xs={3}>
            <Typography variant="body2">
              <b>Window</b>
            </Typography>
          </Grid>
          <Grid item xs={8}>
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
              <IconButton onClick={getWindows}>
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
          <Grid item xs={8}>
            <ToggleButtonGroup exclusive value={config} size="small" color="primary" onChange={handleChangeConfig} sx={{ display: 'flex' }}>
              {settings.map((item) => (
                <ToggleButton key={item} value={item} sx={{ flex: 1 }}>
                  <Box my={-0.2} fontSize={14}>
                    {item}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <Tooltip title="Reset current">
              <IconButton onClick={handleResetConfig}>
                <PlaylistRemoveIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Section>

        <Box mt={2}>
          <Section title="Lock">
            {locks.map((lock) => (
              <Grid item key={lock.key}>
                <FormControlLabel
                  label={lock.name}
                  control={
                    <input
                      type="checkbox"
                      // name={`${index}.loop`}
                      // checked={item.loop ?? false}
                      // disabled={!item.key}
                      // onChange={() => handleBinding(index)}
                    />
                  }
                />
              </Grid>
            ))}
          </Section>
        </Box>

        {groups.map(({ key, title, data }) => (
          <Box key={key} mt={2}>
            <Section title={TextHelper.capitalize(title)}>
              {data.map((item) => {
                const index = bindings.indexOf(item);

                return (
                  <React.Fragment key={index}>
                    <Grid item xs={2} sx={{ position: 'relative' }}>
                      {item.name ? (
                        <Typography variant="body2">
                          <b>{item.name}</b>
                        </Typography>
                      ) : (
                        <Tooltip title="Delete">
                          <IconButton sx={{ position: 'absolute', top: 18, left: -16 }} onClick={() => handleDelete(index)}>
                            <DeleteIcon color="primary" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Hotkey
                        name={`${index}.key`}
                        value={item.key ?? ''}
                        label="Trigger key"
                        onChange={() => handleBinding(index)}
                        sx={{ display: item.name ? 'none' : 'block' }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <FormControlLabel
                        label="Loop"
                        control={
                          <input
                            type="checkbox"
                            name={`${index}.loop`}
                            checked={item.loop ?? false}
                            disabled={!item.key}
                            onChange={() => handleBinding(index)}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.0`}
                        value={item.sequence?.[0] ?? ''}
                        label="Key 1"
                        onChange={() => handleBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.1`}
                        value={item.sequence?.[1] ?? ''}
                        label="Key 2"
                        onChange={() => handleBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.2`}
                        value={item.sequence?.[2] ?? ''}
                        label="Key 3"
                        onChange={() => handleBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} />
                  </React.Fragment>
                );
              })}
            </Section>
          </Box>
        ))}
      </form>
    </React.Fragment>
  );
}

export default Home;
