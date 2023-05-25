import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FormRef } from '@react-bulk/core';
import {
  Backdrop,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  Form,
  Grid,
  Input,
  Link,
  Loading,
  Modal,
  Scrollable,
  Select,
  Text,
  Tooltip,
} from '@react-bulk/web';
import * as dot from 'dot-object';
import electron from 'electron';
import Head from 'next/head';

import GitHubRepository, { GitHubFile } from '../components/GitHubRepository';
import Hotkey from '../components/Hotkey';
import Icon from '../components/Icon';
import Panel from '../components/Panel';
import Title from '../components/Title';
import ArrayHelper from '../helpers/ArrayHelper';
import Storage from '../providers/storage';

const ipcRenderer = electron.ipcRenderer;

const defaultLocks = [
  { key: 'Win', name: 'Meta (Windows Key)' },
  { key: 'PrintScreen', name: 'Print Screen' },
  { key: 'NumLock', name: 'NumLock' },
  { key: 'CapsLock', name: 'CapsLock' },
  { key: 'ScrollLock', name: 'ScrollLock' },
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
  changed?: boolean;
};

export default function Home() {
  const formBindingRef = useRef<FormRef>();
  const formActionRef = useRef<FormRef>();
  const timeoutRef = useRef({});

  // Load/save configs
  const [loading, setLoading] = useState(true);
  const [settings] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [config, setConfig] = useState(settings[0]);
  const store = useMemo(() => Storage.with(config), [config]);

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Models
  const [overlay, setOverlay] = useState(false);
  const [window, setWindow] = useState('');
  const [locks, setLocks] = useState<Lock[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // Components
  const [browseRep, setBrowseRep] = useState(false);
  const [actionModel, setActionModel] = useState<Action>();
  const [bindingModel, setBindingModel] = useState<Binding>();

  // Forms
  const [bindingError, setBindingError] = useState(false);
  const [actionError, setActionError] = useState(false);

  if (!loading && window && !visibleWindows.find((item) => item.ahk_exe === window)) {
    visibleWindows.unshift({ ahk_exe: window, title: '-', short: '-', error: true });
  }

  const getWindows = useCallback(() => {
    const response = ipcRenderer.sendSync('windows');
    setVisibleWindows(JSON.parse(response));
  }, []);

  const withTimeout = (key: string, callback: Function) => {
    if (timeoutRef.current?.[key]) {
      clearTimeout(timeoutRef.current[key]);
    }

    timeoutRef.current[key] = setTimeout(callback, 1000);
  };

  useEffect(() => {
    global.addEventListener('focus', getWindows);

    return () => {
      global.removeEventListener('focus', getWindows);
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    const newWindow = store.get('window', '') as string;
    const newOverlay = store.get('overlay', false) as boolean;
    const newLocks = [...(store.get('locks', []) as Lock[]), ...defaultLocks];
    const newBindings = store.get('bindings', []) as Binding[];

    const newActions = (store.get('actions', []) as Action[]).map((item) => {
      item.changed = true;
      return item;
    });

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

      // Reset changed
      actions.forEach((action) => delete action.changed);
    });
  }, [window, actions]);

  const handleResetConfig = () => {
    if (!global.confirm('Are you sure you want to reset settings number 1?')) {
      return;
    }

    store.clear();
    setWindow('');
    setActions([]);
    setOverlay(false);
    setLocks(defaultLocks);
    setBindings([]);
  };

  const handleToggleLock = (key) => {
    setLocks((current) => {
      const index = current.findIndex((item) => item.key === key);
      current[index].lock = !current[index].lock;
      return [...current];
    });
  };

  function handleEditBinding(key?: string) {
    formBindingRef.current.clear();
    const model = bindings.find((item) => item.key === key);
    setBindingModel(model ?? ({} as Binding));
  }

  function handleSaveBinding(e: FormRef, data: any) {
    dot.object(data);

    const hasError = !data.key || !data.sequence?.[0];
    setBindingError(hasError);
    if (hasError) return;

    setBindings((current) => {
      const model = current.find(({ key }) => key === data.key);

      data.sequence = data.sequence.filter(Boolean);
      data.delay = data.delay.filter(Boolean).map(Number);

      if (model) {
        Object.assign(model, data);
      } else {
        current.push(data);
      }

      return [...current];
    });

    setBindingModel(null);
  }

  function handleDeleteBinding(key) {
    if (!global.confirm(`Are you sure you want to remove binding for key "${key}"?`)) {
      return;
    }

    setBindings((current) => {
      return current.filter((item) => item.key !== key);
    });
  }

  const handleChangeGithub = (file: GitHubFile) => {
    const buffer = new Buffer(file.content, 'base64');
    const label = file.path.replace(/\.ahk$/, '');
    const script = buffer.toString('ascii');

    setActionModel({ label, script });
    setBrowseRep(false);
  };

  const handleToggleAction = (label) => {
    setActions((current) => {
      const index = current.findIndex((item) => item.label === label);

      current[index].changed = true;
      current[index].enabled = !current[index].enabled;

      return [...current];
    });
  };

  const handleDeleteAction = (label) => {
    if (!global.confirm(`Are you sure you want to remove action "${label}"?`)) {
      return;
    }

    setActions((current) => {
      return current.filter((item) => item.label !== label);
    });
  };

  const handleSaveAction = (e: FormRef, data: any) => {
    dot.object(data);

    const hasError = !`${data.label || ''}`.trim();
    setActionError(hasError);
    if (hasError) return;

    setActions((current) => {
      const model = current.find(({ label }) => label === data.label);

      data.changed = true;

      if (model) {
        Object.assign(model, data);
      } else {
        current.push(data);
      }

      return [...current];
    });

    setActionModel(undefined);
  };

  if (loading) {
    return <Loading size={6} h="100vh" />;
  }

  return (
    <>
      <Box p={3}>
        <Head>
          <title>Awy Bot</title>
        </Head>

        <Panel title="Settings">
          <Box row noWrap>
            <ButtonGroup flex>
              {settings.map((item) => (
                <Button key={item} variant={config === item ? 'solid' : 'outline'} px={3} onPress={() => setConfig(item)}>
                  {item}
                </Button>
              ))}
            </ButtonGroup>
            <Box ml={3}>
              <Checkbox name="overlay" label="Overlay" checked={overlay} onChange={() => setOverlay((current) => !current)} />
            </Box>
            <Box ml={3}>
              <Tooltip title="Reset current settings" position="left">
                <Button variant="outline" color="red" onPress={handleResetConfig}>
                  <Icon name="Trash" color="error" />
                </Button>
              </Tooltip>
            </Box>
          </Box>

          <Box row noWrap mt={3}>
            <Box flex>
              <Select
                name="window"
                label="Window"
                value={window}
                onChange={(e, value) => setWindow(value)}
                options={
                  [
                    { value: '', label: '-- ALL --' },
                    ...ArrayHelper.uniqueBy(visibleWindows, 'ahk_exe').map((win) => ({
                      value: win.ahk_exe,
                      label: (
                        <Box row noWrap>
                          <Text bold color={win.error ? 'error' : 'info'}>
                            [{win.ahk_exe.toLowerCase()}]
                          </Text>
                          <Text flex ml={2}>
                            {win.short.substring(0, 60)}
                            {win.short.length > 60 ? ' ...' : ''}
                          </Text>
                          {win.error && <Badge color="error">not running</Badge>}
                        </Box>
                      ),
                    })),
                  ] as any[]
                }
              />
            </Box>
            <Box ml={3} align="end">
              <Tooltip title="Refresh">
                <Button onPress={getWindows}>
                  <Icon name="Refresh" color="white" />
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Panel>

        <Panel title={`Key Locks (${locks.filter(({ lock }) => lock).length}/${locks.length})`} initialExpanded={false} mt={3}>
          {locks.map((item, index) => (
            <Box key={item.key}>
              {index > 0 && <Divider mx={-3} my={3} />}

              <Box row noWrap center>
                <Box>
                  <Tooltip title={item.lock ? 'Click to turn off' : 'Click to turn on'} position="right">
                    <Button
                      size="small"
                      variant={item.lock ? 'solid' : 'outline'}
                      color={item.lock ? 'success' : 'error'}
                      onPress={() => handleToggleLock(item.key)}
                    >
                      {item.lock ? 'ON' : 'OFF'}
                    </Button>
                  </Tooltip>
                </Box>
                <Text bold flex mx={3}>
                  {item.name}
                </Text>
              </Box>
            </Box>
          ))}
        </Panel>

        <Panel title={`Key Bindings (${bindings.length})`} initialExpanded={false} mt={3}>
          {bindings.map((item, index) => (
            <Box key={index}>
              <Box row noWrap>
                <Box row flex alignItems="center">
                  <Text bold>WHEN</Text>

                  <Badge color="primary" mx={3}>
                    {item.name ?? item.key}
                  </Badge>

                  <Text bold>THEN</Text>

                  {item.sequence.map((key, index) => (
                    <Box key={index} row noWrap>
                      {index > 0 && <Text ml={3}>⟶</Text>}

                      <Badge color="info" ml={3}>
                        {key}
                      </Badge>

                      {Boolean(item?.delay?.[index]) && (
                        <>
                          <Text ml={3}>⟶</Text>
                          <Badge color="warning.dark" ml={3}>
                            wait {item.delay[index]}ms
                          </Badge>
                        </>
                      )}
                    </Box>
                  ))}
                </Box>

                <Box ml={1.5}>
                  <Tooltip title="Edit" position="left">
                    <Button variant="outline" size="small" onPress={() => handleEditBinding(item.key)}>
                      <Icon name="Edit" />
                    </Button>
                  </Tooltip>
                </Box>

                <Box ml={1.5}>
                  <Tooltip title="Remove" position="left">
                    <Button variant="outline" size="small" color="error" onPress={() => handleDeleteBinding(item.key)}>
                      <Icon name="Trash" color="error" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Divider mx={-3} my={3} />
            </Box>
          ))}

          <Button onPress={handleEditBinding}>Add New Binding</Button>
        </Panel>

        <Panel
          title={`Advanced Scripts (${actions.filter(({ enabled }) => enabled).length}/${actions.length})`}
          initialExpanded={false}
          mt={3}
        >
          {actions.map((item) => (
            <Box key={item.label}>
              <Box row noWrap center>
                <Box>
                  <Tooltip title={item.enabled ? 'Click to turn off' : 'Click to turn on'} position="right">
                    <Button
                      size="small"
                      variant={item.enabled ? 'solid' : 'outline'}
                      color={item.enabled ? 'success' : 'error'}
                      onPress={() => handleToggleAction(item.label)}
                    >
                      {item.enabled ? 'ON' : 'OFF'}
                    </Button>
                  </Tooltip>
                </Box>
                <Text bold flex mx={3}>
                  {item.label}
                </Text>
                <Text color="text.secondary" numberOfLines={1}>
                  {`${item.script || ''}`.split(`\n`).shift()}
                </Text>
                <Box ml={1.5}>
                  <Tooltip title="Edit" position="left">
                    <Button variant="outline" size="small" onClick={() => setActionModel(item)}>
                      <Icon name="Edit" />
                    </Button>
                  </Tooltip>
                </Box>
                <Box ml={1.5}>
                  <Tooltip title="Remove" position="left">
                    <Button variant="outline" size="small" color="error" onClick={() => handleDeleteAction(item.label)}>
                      <Icon name="Trash" color="error" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Divider mx={-3} my={3} />
            </Box>
          ))}

          <Grid gap={3}>
            <Box xs>
              <Button variant="outline" onPress={() => setActionModel({ label: '', script: '', new: true })}>
                Create New Script
              </Button>
            </Box>
            <Box xs>
              <Button onPress={() => setBrowseRep(true)}>Browse Repository</Button>
            </Box>
          </Grid>
        </Panel>
      </Box>

      <Modal visible={browseRep} onBackdropPress={() => setBrowseRep(false)}>
        <Box m={-3} w={320} h={320}>
          <GitHubRepository onChange={handleChangeGithub} />
        </Box>
      </Modal>

      <Modal visible={Boolean(bindingModel)}>
        <Form ref={formBindingRef} onSubmit={handleSaveBinding}>
          <Title size={1.15} center>
            WHEN
          </Title>

          <Box mt={3}>
            <Hotkey name="key" label="Trigger Key" value={bindingModel?.key} error={bindingError} />
          </Box>

          <Divider my={3} mx={-3} />

          <Title size={1.15} center>
            THEN
          </Title>

          {[0, 1, 2].map((keyNumber) => (
            <Box key={keyNumber} row noWrap mt={3}>
              <Hotkey
                name={`sequence.${keyNumber}`}
                label={`Key ${keyNumber + 1}`}
                value={bindingModel?.sequence?.[keyNumber]}
                error={bindingError}
                w={240}
              />
              <Input //
                type="number"
                name={`delay.${keyNumber}`}
                label="Delay"
                value={bindingModel?.delay?.[keyNumber]}
                w={120}
                ml={3}
                endAddon={<Text>ms</Text>}
              />
            </Box>
          ))}

          <Divider my={3} mx={-3} />

          <Box>
            <Checkbox name="loop" label="Use as toggler (enable/disable)" />
          </Box>

          <Divider my={3} mx={-3} />

          <Grid gap={3}>
            <Box xs>
              <Button variant="text" onPress={() => setBindingModel(undefined)}>
                Cancel
              </Button>
            </Box>
            <Box xs>
              <Button type="submit">Save</Button>
            </Box>
          </Grid>
        </Form>
      </Modal>

      <Backdrop visible={Boolean(actionModel)} p={6}>
        <Card p={0} overflow="hidden" maxh="100%">
          <Scrollable contentInset={3}>
            <Panel title="Need help?" initialExpanded={false} m={-3}>
              <Text>
                Feel free to use anything from{' '}
                <Link href="https://www.autohotkey.com/docs/v1" target="autohotkey">
                  AutoHotkey v1
                </Link>
                .
              </Text>
              <Text mt={3}>Some extra functions may be used:</Text>
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
            </Panel>

            <Divider my={3} mx={-3} />

            <Form ref={formActionRef} onSubmit={handleSaveAction}>
              <Input //
                readOnly={!actionModel?.new}
                name="label"
                label="Label (must be unique, overrides if not)"
                value={actionModel?.label}
                error={actionError ? 'Required' : null}
                mask={(value) => `${value ?? ''}`.replace(/\W/g, '')}
                unmask={(value) => `${value ?? ''}`.replace(/\W/g, '')}
              />
              <Input //
                name="script"
                label="Script"
                value={actionModel?.script}
                multiline
                rows={20}
                mt={3}
                fontFamily="Consolas, Courier"
              />

              <Divider my={3} mx={-3} />

              <Grid gap={3}>
                <Box xs>
                  <Button variant="text" onPress={() => setActionModel(undefined)}>
                    Cancel
                  </Button>
                </Box>
                <Box xs>
                  <Button type="submit">Save</Button>
                </Box>
              </Grid>
            </Form>
          </Scrollable>
        </Card>
      </Backdrop>
    </>
  );
}

const FnColor = ({ name, params = null, description = null }) => (
  <Text mt={2}>
    <Text color="info">{name}</Text>
    <Text color="text.secondary">({params ?? ''})</Text>
    {Boolean(description) && (
      <Text color="text.disabled" ml={1}>
        {description}
      </Text>
    )}
  </Text>
);
