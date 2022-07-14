import React, { useEffect, useMemo, useRef, useState } from 'react';

import axios from 'axios';
import electron from 'electron';
import Head from 'next/head';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Hotkey from '../components/Hotkey';
import Loading from '../components/Loading';
import Section from '../components/Section';
import ArrayHelper from '../helpers/ArrayHelper';
import TextHelper from '../helpers/TextHelper';
import Storage from '../providers/storage';

const ipcRenderer = electron.ipcRenderer;

const gitUrlMain = 'https://api.github.com/repos/caioedut/awy-bot-scripts/git/trees/main';

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
  ahk_exe: string;
  title: string;
  short: string;
  error?: boolean;
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
  new?: boolean;
};

export default function Home() {
  const formRef = useRef(null);
  const timeoutRef = useRef({});

  // Load/save configs
  const [loading, setLoading] = useState(true);
  const [settings] = useState([1, 2, 3, 4, 5, 7, 8, 9, 10]);
  const [config, setConfig] = useState(settings[0]);
  const store = useMemo(() => Storage.with(config), [config]);

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Script repository
  const [repositoryFiles, setRepositoryFiles] = useState(null);

  // Models
  const [overlay, setOverlay] = useState(false);
  const [window, setWindow] = useState('');
  const [locks, setLocks] = useState<Lock[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // Components
  const [actionModel, setActionModel] = useState<Action>(null);

  if (!bindings.find((item) => !item?.key && !item?.sequence?.length)) {
    bindings.push({ group: 'keyboard', key: '', sequence: [], delay: [0, 0] });
  }

  if (!loading && window && !visibleWindows.find((item) => item.ahk_exe === window)) {
    visibleWindows.unshift({ ahk_exe: window, title: '-', short: '-', error: true });
  }

  function getWindows() {
    const response = ipcRenderer.sendSync('windows');
    setVisibleWindows(JSON.parse(response));
  }

  const withTimeout = (key: string, callback: Function) => {
    if (timeoutRef.current?.[key]) {
      clearTimeout(timeoutRef.current[key]);
    }

    timeoutRef.current[key] = setTimeout(callback, 1000);
  };

  useEffect(() => {
    setLoading(true);

    const newWindow = store.get('window', '') as string;
    const newOverlay = store.get('overlay', false) as boolean;
    const newActions = store.get('actions', []) as Action[];
    const newLocks = [...(store.get('locks', []) as Lock[]), ...defaultLocks];
    const newBindings = [...(store.get('bindings', []) as Binding[]), ...defaultBindings];

    setWindow(newWindow);
    setOverlay(newOverlay);
    setActions(newActions);
    setLocks(ArrayHelper.uniqueBy(newLocks, 'key', false));
    setBindings(ArrayHelper.uniqueBy(newBindings, 'key', false));

    setLoading(false);
  }, [store]);

  useEffect(() => {
    if (!loading) {
      getWindows();
    }
  }, [loading]);

  useEffect(() => {
    store.set('window', window);

    withTimeout('main', () => {
      const data = { window };
      ipcRenderer.sendSync('main', JSON.stringify(data));
    });
  }, [window]);

  useEffect(() => {
    store.set('overlay', overlay);
    const data = { window, overlay };
    ipcRenderer.sendSync('overlay', JSON.stringify(data));
  }, [window, overlay]);

  useEffect(() => {
    store.set('locks', locks);

    withTimeout('locks', () => {
      const data = { window, locks };
      ipcRenderer.sendSync('lock', JSON.stringify(data));
    });
  }, [window, locks]);

  useEffect(() => {
    store.set('bindings', bindings);

    withTimeout('bindings', () => {
      const data = { window, bindings };
      ipcRenderer.sendSync('remap', JSON.stringify(data));
    });
  }, [window, bindings]);

  useEffect(() => {
    store.set('actions', actions);

    withTimeout('actions', () => {
      const enabled = actions?.filter(({ enabled }) => enabled);
      const data = { window, actions: enabled };
      ipcRenderer.sendSync('actions', JSON.stringify(data));
    });
  }, [window, actions]);

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
    setWindow('');
    setActions([]);
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

  const handleRepository = async (git: { type: string; path: string; url: string } = null) => {
    git = git || {
      type: 'tree',
      path: 'Root',
      url: gitUrlMain,
    };

    if (git.type === 'tree') {
      const { data } = await axios.get(git.url);
      const files = data.tree.map(({ type, path, url }) => ({ type, path, url }));
      return setRepositoryFiles(files);
    }

    const { data } = await axios.get(git.url);
    const buffer = new Buffer(data.content, 'base64');

    const label = git.path.replace(/\.ahk$/, '');
    const script = buffer.toString('ascii');

    setRepositoryFiles(null);
    setActionModel({ label, script });
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

  if (loading) {
    return <Loading />;
  }

  return (
    <Fade in={!loading}>
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
                  <MenuItem key={index} value={win.ahk_exe}>
                    <Box component="b" color={win.error ? 'error.main' : 'info.main'}>
                      [{win.ahk_exe.toLowerCase()}]
                    </Box>
                    :&nbsp;&nbsp;{win.short}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Box height={44} />
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
              <ToggleButtonGroup exclusive value={config} color="primary" onChange={handleChangeConfig} sx={{ display: 'flex' }}>
                {settings.map((item) => (
                  <ToggleButton key={item} value={item} sx={{ flex: 1 }}>
                    <Box component="b" my={-0.2}>
                      {item}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Box height={44} />
            <Grid item width={52}>
              <Tooltip title="Reset current">
                <IconButton onClick={handleResetConfig}>
                  <PlaylistRemoveIcon color="primary" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Box width="100%" />
            <Grid item xs={2}>
              <Typography variant="body2">
                <b>Overlay</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Switch checked={overlay} onChange={handleOverlay} />
            </Grid>
            <Box height={44} />
          </Section>

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
                    <Button onClick={() => setActionModel(item)}>
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button>
                      <DeleteIcon fontSize="small" onClick={() => handleDeleteAction(item.label)} />
                    </Button>
                  </ButtonGroup>
                </Grid>
              ))}
              <Grid item>
                <Button variant="outlined" onClick={() => setActionModel({ label: '', script: '', new: true })}>
                  Create New
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => handleRepository()}>
                  Browse Repository
                </Button>
              </Grid>
            </Section>
          </Box>

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
                            <IconButton sx={{ position: 'absolute', top: 12, left: -22 }} onClick={() => handleDelete(index)}>
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
              <Box mb={2}>
                <Box component="b" color="primary.main">
                  Feel free to use anything from{' '}
                  <Link href="https://www.autohotkey.com/docs" target="autohotkey">
                    AutoHotkey.
                  </Link>
                  <br />
                  Some extra functions may be used:
                </Box>
                <FnColor
                  name="xSend"
                  params="Key, ReleaseKey := Key"
                  description={'Send down a "Key" and wait the "ReleaseKey" go up to release the "Key".'}
                />
                <FnColor name="Notify" params="Message" description="Show a notification on screen." />
                <FnColor name="HotkeyClear" params="Key" description="Remove brackets {} from a hotkey string." />
                <FnColor
                  name="SetOverlay"
                  params={'Key, Value := 1, Session := "Default"'}
                  description="Add text to Session on Overlay Window."
                />
                <FnColor name="ClearOverlay" params="Session" description="Reset Overlay Window content for a Session." />
                <FnColor name="MouseLock" description="User will be unable to move the mouse." />
                <FnColor name="MouseRelease" description="User will be able to move the mouse again." />
                <FnColor name="MouseBackup" description={'Backup cursor position to use with "MouseRestore"'} />
                <FnColor name="MouseRestore" description={'Restore cursor position stored from "MouseBackup"'} />
                <FnColor name="GetText" params="FromX, FromY, ToX, ToY" description="Get text from a specific screen position." />
                <FnColor name="GetFile" params="DestinationPath, URL" description="Download a file to use on custom actions." />
              </Box>
              <TextField
                disabled={!actionModel?.new}
                name="label"
                label="Label (must be unique, overrides if not)"
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
                rows={20}
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

          <Dialog open={Boolean(repositoryFiles)} maxWidth="xs" fullWidth>
            <DialogTitle>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Tooltip title="Go to root directory">
                    <IconButton edge="start" onClick={() => handleRepository()}>
                      <HomeOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>Browse Repository</Grid>
              </Grid>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={1} alignItems="center">
                {repositoryFiles?.map((file) => (
                  <Grid item key={file.url}>
                    <Button //
                      variant={file.type === 'tree' ? 'contained' : 'outlined'}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleRepository(file)}
                      startIcon={file.type === 'tree' ? <FolderOutlinedIcon /> : <IntegrationInstructionsOutlinedIcon />}
                    >
                      {file.path.replace(/\.ahk$/, '')}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRepositoryFiles(null)}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </form>
      </Box>
    </Fade>
  );
}

const FnColor = ({ name, params = null, description = null }) => (
  <Box>
    <Box component="span" color="info.main">
      {name}
    </Box>
    <Box component="span" color="text.secondary">
      ({params ?? ''})
    </Box>
    {Boolean(description) && (
      <Box component="span" color="text.disabled" ml={1}>
        {description}
      </Box>
    )}
  </Box>
);
