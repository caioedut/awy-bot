import React, { useEffect, useMemo, useRef, useState } from 'react';

import electron from 'electron';
import Head from 'next/head';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
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

const defaultLocks = [
  { key: 'Win', name: 'Windows' },
  { key: 'PrintScreen', name: 'Print Screen' },
  { key: 'NumLock', name: 'NumLock' },
  { key: 'CapsLock', name: 'CapsLock' },
  { key: 'ScrollLock', name: 'ScrollLock' },
];

const defaultBindings: Binding[] = [
  { group: 'mouse', key: 'MButton', sequence: [], delay: [0, 0], name: 'Mouse Middle' },
  { group: 'mouse', key: 'XButton1', sequence: [], delay: [0, 0], name: 'Mouse X1' },
  { group: 'mouse', key: 'XButton2', sequence: [], delay: [0, 0], name: 'Mouse X2' },
  { group: 'mouse', key: 'WheelUp', sequence: [], delay: [0, 0], name: 'Scroll Up' },
  { group: 'mouse', key: 'WheelDown', sequence: [], delay: [0, 0], name: 'Scroll Down' },
];

type Window = {
  ahk_id: string;
  ahk_exe: string;
  title: string;
  short: string;
};

type Lock = {
  key: string;
  name?: string;
  lock?: boolean;
};

type Binding = {
  key: string;
  sequence: string[];
  delay: number[];
  group: string;
  name?: string;
  loop?: boolean;
};

type Action = {
  label: string;
  script: string;
  enabled?: boolean;
};

export default function Home() {
  const formRef = useRef(null);
  const timeoutRef = useRef({});

  // Load/save configs
  const [settings] = useState([1, 2, 3, 4, 5, 7, 8, 9, 10]);
  const [config, setConfig] = useState(settings[0]);
  const store = useMemo(() => Storage.with(config), [config]);

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Models
  const [overlay, setOverlay] = useState(false);
  const [window, setWindow] = useState('');
  const [locks, setLocks] = useState<Lock[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [raw, setRaw] = useState('');
  const [actions, setActions] = useState<Action[]>([]);

  // Components
  const [inputRaw, setInputRaw] = useState<string>(null);
  const [actionModel, setActionModel] = useState<Action>(null);

  if (!bindings.find((item) => !item?.key && !item?.sequence?.length)) {
    bindings.push({ group: 'keyboard', key: '', sequence: [], delay: [0, 0] });
  }

  useMount(getWindows);

  const withTimeout = (key: string, callback: Function) => {
    if (timeoutRef.current?.[key]) {
      clearTimeout(timeoutRef.current[key]);
    }

    timeoutRef.current[key] = setTimeout(callback, 1000);
  };

  useEffect(() => {
    const newOverlay = store.get('overlay', false) as boolean;
    const newRaw = store.get('raw', null) as string;
    const newActions = store.get('actions', []) as Action[];
    const newLocks = [...(store.get('locks', []) as Lock[]), ...defaultLocks];
    const newBindings = [...(store.get('bindings', []) as Binding[]), ...defaultBindings];

    setOverlay(newOverlay);
    setActions(newActions);
    setRaw(newRaw);
    setLocks(ArrayHelper.uniqueBy(newLocks, 'key', false));
    setBindings(ArrayHelper.uniqueBy(newBindings, 'key', false));
  }, [store]);

  useEffect(() => {
    withTimeout('main', () => {
      const data = window ? { window } : {};
      ipcRenderer.sendSync('main', JSON.stringify(data));
    });
  }, [window]);

  useEffect(() => {
    store.set('overlay', overlay);
    const data = overlay ? { window, overlay } : {};
    ipcRenderer.sendSync('overlay', JSON.stringify(data));
  }, [window, overlay]);

  useEffect(() => {
    store.set('locks', locks);

    withTimeout('locks', () => {
      const data = window && locks ? { window, locks } : {};
      ipcRenderer.sendSync('lock', JSON.stringify(data));
    });
  }, [window, locks]);

  useEffect(() => {
    store.set('raw', raw);

    withTimeout('raw', () => {
      const data = window && raw ? { window, raw } : {};
      ipcRenderer.sendSync('raw', JSON.stringify(data));
    });
  }, [window, raw]);

  useEffect(() => {
    store.set('bindings', bindings);

    withTimeout('bindings', () => {
      const data = window && bindings ? { window, bindings } : {};
      ipcRenderer.sendSync('remap', JSON.stringify(data));
    });
  }, [window, bindings]);

  useEffect(() => {
    store.set('actions', actions);

    withTimeout('actions', () => {
      const enabled = actions?.filter(({ enabled }) => enabled);
      const data = window && enabled ? { window, actions: enabled } : {};
      ipcRenderer.sendSync('actions', JSON.stringify(data));
    });
  }, [window, actions]);

  function getWindows() {
    const response = ipcRenderer.sendSync('windows');
    setVisibleWindows(JSON.parse(response));
  }

  const getNumber = (value) => {
    value = Number(value || 0);
    return isNaN(value) ? 0 : value;
  };

  const getSequence = (index) => {
    return [
      formRef.current[`${index}.sequence.0`]?.value,
      formRef.current[`${index}.sequence.1`]?.value,
      formRef.current[`${index}.sequence.2`]?.value,
    ].filter(Boolean);
  };

  const getDelay = (index) => {
    return [
      // Force numeric values
      getNumber(formRef.current[`${index}.delay.0`]?.value),
      getNumber(formRef.current[`${index}.delay.1`]?.value),
    ].map(Number);
  };

  const getData = (index) => {
    return {
      key: formRef.current[`${index}.key`]?.value,
      sequence: getSequence(index),
      delay: getDelay(index),
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
    setActions([]);
    setRaw(null);
    setOverlay(false);
    setLocks(defaultLocks);
    setBindings(defaultBindings);
  };

  const handleLock = (index, lock = true) => {
    const newLocks = [...locks];
    newLocks[index].lock = lock;
    setLocks(newLocks);
  };

  const handleKeyDownDelay = (index, e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Escape') {
      e.target.value = '0';
      e.target.blur();
      handleBinding(index);
    }
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

  const handleOverlay = () => {
    setOverlay((current) => !current);
  };

  const handleEditRaw = () => {
    setInputRaw(raw ?? '');
  };

  const handleSaveRaw = () => {
    setRaw(inputRaw);
    setInputRaw(null);
  };

  const handleToggleAction = (label) => {
    const newActions = [...actions];

    const index = newActions.findIndex((item) => item.label === label);
    newActions[index].enabled = !newActions[index].enabled;

    setActions(newActions);
  };

  const handleDeleteAction = (label) => {
    const newActions = [...actions];

    const index = newActions.findIndex((item) => item.label === label);
    newActions.splice(index, 1);

    setActions(newActions);
  };

  const handleSaveAction = () => {
    const newActions = [...actions];
    const model = actions.find(({ label }) => label === actionModel.label);

    if (model) {
      Object.assign(model, actionModel);
    } else {
      newActions.push(actionModel);
    }

    setActions([...newActions]);
    setActionModel(null);
  };

  const groups = ArrayHelper.groupBy(bindings, 'group');

  return (
    <Box p={2}>
      <Head>
        <title>Awy Bot</title>
      </Head>

      <form ref={formRef}>
        <Section title="Application">
          <Grid item xs={2}>
            <Typography variant="body2">
              <b>Window</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Select value={window ?? ''} onChange={handleChangeWindow} autoFocus>
              <MenuItem value="">[Select a window]</MenuItem>
              {visibleWindows.map((win, index) => (
                <MenuItem key={index} value={win.ahk_id}>
                  <Box component="span" color="text.disabled">
                    [{win.ahk_exe.toLowerCase()}]
                  </Box>
                  :&nbsp;&nbsp;{win.short}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item width={52}>
            <Tooltip title="Refresh">
              <IconButton onClick={getWindows}>
                <RefreshIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Box width="100%" />
          <Grid item xs={2}>
            <Typography variant="body2">
              <b>Settings</b>
            </Typography>
          </Grid>
          <Grid item xs>
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
          <Grid item width={52}>
            <Tooltip title="Reset current">
              <IconButton onClick={handleResetConfig}>
                <PlaylistRemoveIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Box width="100%" />
          <Grid item xs>
            <FormControlLabel //
              label="Overlay"
              control={<Switch checked={overlay} onChange={handleOverlay} />}
            />
          </Grid>
          <Grid item xs textAlign="right">
            <Button variant="contained" onClick={handleEditRaw}>
              Custom Raw Script
            </Button>
          </Grid>
        </Section>

        <Box mt={2}>
          <Section title="Lock">
            {locks.map((item, index) => (
              <Grid item key={item.key}>
                <FormControlLabel
                  label={item.name}
                  control={
                    <input //
                      type="checkbox"
                      checked={item.lock ?? false}
                      onChange={(e) => handleLock(index, e.target.checked)}
                    />
                  }
                />
              </Grid>
            ))}
          </Section>
        </Box>

        <Box mt={2}>
          <Section title="Actions" justifyContent="initial">
            {actions.map((item) => (
              <Grid item key={item.label}>
                <ButtonGroup variant="outlined">
                  <Button
                    variant={item.enabled ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                    onClick={() => handleToggleAction(item.label)}
                  >
                    [{item.enabled ? 'ON' : 'OFF'}] {item.label}
                  </Button>
                  <Button size="small" onClick={() => setActionModel(item)}>
                    <EditIcon fontSize="small" />
                  </Button>
                  <Button size="small">
                    <DeleteIcon fontSize="small" onClick={() => handleDeleteAction(item.label)} />
                  </Button>
                </ButtonGroup>
              </Grid>
            ))}
            <Grid item>
              <Button variant="contained" onClick={() => setActionModel({ label: '', script: '' })}>
                Create New
              </Button>
            </Grid>
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
                    {[0, 1, 2].map((keyNumber) => (
                      <React.Fragment key={keyNumber}>
                        <Grid item xs={2}>
                          <Hotkey
                            allowMouse
                            name={`${index}.sequence.${keyNumber}`}
                            value={item.sequence?.[keyNumber] ?? ''}
                            label={`Key ${keyNumber + 1}`}
                            onChange={() => handleBinding(index)}
                          />
                        </Grid>
                        {keyNumber < 2 && (
                          <Grid item xs={1}>
                            <TextField //
                              name={`${index}.delay.${keyNumber}`}
                              value={item.delay?.[keyNumber] ?? ''}
                              label="Delay"
                              onChange={() => handleBinding(index)}
                              onKeyDown={(e) => handleKeyDownDelay(index, e)}
                            />
                          </Grid>
                        )}
                      </React.Fragment>
                    ))}
                    <Grid item xs={12} />
                  </React.Fragment>
                );
              })}
            </Section>
          </Box>
        ))}

        <Dialog open={Boolean(actionModel)} maxWidth="lg" fullWidth>
          <DialogTitle>Edit Action</DialogTitle>
          <DialogContent>
            <TextField
              name="label"
              label="Label"
              value={actionModel?.label ?? ''}
              sx={{ mt: 1 }}
              onChange={({ target }) => {
                setActionModel((current) => ({
                  ...current,
                  [target.name]: target.value.replace(/\W/g, ''),
                }));
              }}
            />
            <TextField
              multiline
              name="script"
              label="Script"
              rows={30}
              value={actionModel?.script ?? ''}
              sx={{ mt: 3 }}
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: 12 },
              }}
              onChange={({ target }) => {
                setActionModel((current) => ({
                  ...current,
                  [target.name]: target.value,
                }));
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionModel(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveAction} disabled={!actionModel?.label?.trim() || !actionModel?.script?.trim()}>
              Save Action
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={inputRaw !== null} maxWidth="lg" fullWidth>
          <DialogTitle>Custom Raw Script</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              name="raw"
              rows={30}
              value={inputRaw ?? ''}
              onChange={(e) => setInputRaw(e.target.value)}
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: 12 },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInputRaw(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveRaw}>
              Save and Run
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </Box>
  );
}
