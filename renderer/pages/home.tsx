import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FormRef } from '@react-bulk/core';
import {
  Backdrop,
  Badge,
  Box,
  Button,
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
  useTheme,
} from '@react-bulk/web';
import * as dot from 'dot-object';
import electron from 'electron';
import Head from 'next/head';

import CheckUpdate from '../components/CheckUpdate';
import GitHubRepository, { GitHubFile } from '../components/GitHubRepository';
import Hotkey from '../components/Hotkey';
import Icon from '../components/Icon';
import Panel from '../components/Panel';
import Title from '../components/Title';
import ArrayHelper from '../helpers/ArrayHelper';
import service from '../providers/service';
import Storage from '../providers/storage';

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
  index?: number;
  key: string;
  sequence: string[];
  delay: number[];
  group: string;
  name?: string;
  loop?: boolean;
  modifiers?: boolean;
};

type Action = {
  label: string;
  script: string;
  enabled?: boolean;
  new?: boolean;
  changed?: boolean;
};

const ipcRenderer = electron.ipcRenderer;

const globalStore = Storage.with('global');

const settings = Array.from({ length: 20 }).map((_, index) => index + 1);

const defaultLocks = [
  { key: 'Win', name: 'Meta (Windows Key)' },
  { key: 'PrintScreen', name: 'Print Screen' },
  { key: 'NumLock', name: 'NumLock' },
  { key: 'CapsLock', name: 'CapsLock' },
  { key: 'ScrollLock', name: 'ScrollLock' },
];

export default function Home() {
  const theme = useTheme();
  const { gap } = theme.shape;

  const settingsScrollRef = useRef<HTMLElement>();
  const formBindingRef = useRef<FormRef>();
  const formActionRef = useRef<FormRef>();
  const timeoutRef = useRef({});

  // Load/save configs
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(settings[0]);
  const store = useMemo(() => Storage.with(config), [config]);

  // Config Name
  const [configNames, setConfigNames] = useState<string[]>(
    (globalStore.get('configNames') as string[]) ?? Array.from({ length: settings.length }),
  );
  const [editConfigNameIndex, setEditConfigNameIndex] = useState<number>();

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Models
  const [autoSwitch, setAutoSwitch] = useState(globalStore.get('autoSwitch', false) as boolean);
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
    const response = service('getWindows');
    setVisibleWindows(response?.data ?? []);
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

    const newOverlay = store.get('overlay', false) as boolean;
    const newWindow = store.get('window', '') as string;
    const newLocks = [...(store.get('locks', []) as Lock[]), ...defaultLocks];
    const newBindings = store.get('bindings', []) as Binding[];

    const newActions = (store.get('actions', []) as Action[]).map((item) => {
      item.changed = true;
      return item;
    });

    setOverlay(newOverlay);
    setWindow(newWindow);
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
    globalStore.set('autoSwitch', autoSwitch);

    if (!autoSwitch) return;

    const interval = setInterval(() => {
      const response = service('getActiveWindow');
      const activeWindow = `${response?.data || ''}`.trim().toLowerCase();

      if (!activeWindow) return;

      for (const setting of settings) {
        const store = Storage.with(setting);
        const configWindow = `${store.get('window') || ''}`.trim().toLowerCase();

        if (configWindow === activeWindow && setting !== config) {
          setConfig(setting);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [config, autoSwitch]);

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

  useEffect(() => {
    const $el = settingsScrollRef.current;

    if (!$el) return;

    function listener(e) {
      e.preventDefault();
      $el.scrollLeft += e.deltaY;
    }

    $el.addEventListener('wheel', listener);

    return () => {
      $el.removeEventListener('wheel', listener);
    };
  }, [settingsScrollRef]);

  const handleResetConfig = () => {
    if (!global.confirm(`Are you sure you want to reset settings number ${config}?`)) {
      return;
    }

    store.clear();
    setWindow('');
    setOverlay(false);
    setLocks(defaultLocks);
    setBindings([]);
    setActions([]);
  };

  const handleChangeConfig = (key) => {
    if (key === config) {
      setEditConfigNameIndex(key);
      return;
    }

    setConfig(key);
  };

  const handleSaveConfigName = (e: any, data: any) => {
    configNames[editConfigNameIndex] = data.name;
    globalStore.set('configNames', configNames);
    setConfigNames([...configNames]);
    setEditConfigNameIndex(undefined);
  };

  const handleToggleLock = (key) => {
    setLocks((current) => {
      const index = current.findIndex((item) => item.key === key);
      current[index].lock = !current[index].lock;
      return [...current];
    });
  };

  function handleEditBinding(index?: number) {
    const model = bindings?.[index] || ({} as Binding);
    setBindingModel({ ...model, index: index ?? null });
  }

  function handleSaveBinding(e: FormRef, data: any) {
    dot.object(data);

    const hasError = !data.key || !data.sequence?.[0];
    setBindingError(hasError);
    if (hasError) return;

    setBindings((current) => {
      const model = current?.[data.index];

      data.sequence = data.sequence.filter(Boolean);
      data.delay = data.delay.map((value) => Number(value ?? 0));

      if (model) {
        Object.assign(model, data);
      } else {
        current.push(data);
      }

      return [...current];
    });

    setBindingModel(undefined);
  }

  function handleDeleteBinding(index?: number) {
    if (!global.confirm(`Are you sure you want to remove this binding?`)) {
      return;
    }

    setBindings((current) => {
      return current.filter((_, itemIndex) => itemIndex !== index);
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
      <Box p={gap}>
        <Head>
          <title>Awy Bot</title>
        </Head>

        <Panel title={`Settings (#${config} : ${window || 'ALL'})`}>
          <Box>
            <Checkbox
              name="autoSwitch"
              label="[BETA] Auto switch settings based on active window"
              checked={autoSwitch}
              onChange={() => setAutoSwitch((current) => !current)}
            />
          </Box>

          <Box row noWrap mt={gap} center>
            <Scrollable ref={settingsScrollRef} direction="horizontal" contentInset={1} m={-1}>
              <Grid gap={2}>
                {settings.map((item) => {
                  const isSelected = config === item;
                  const label = `${configNames[item] || item || ''}`;

                  return (
                    <Box key={item}>
                      <Box row flex noWrap corners={1} overflow="hidden" bg={isSelected ? 'primary' : 'trans'}>
                        <Button
                          flex
                          variant={isSelected ? 'solid' : 'outline'}
                          onPress={() => handleChangeConfig(item)}
                          onContextMenu={() => setEditConfigNameIndex(item)}
                        >
                          <Text
                            flex
                            center
                            lh={1}
                            maxw={48}
                            numberOfLines={2}
                            fontSize={label.length > 2 ? 10 : 12}
                            style={{ wordBreak: 'break-all' }}
                          >
                            {label}
                          </Text>
                        </Button>

                        {isSelected && (
                          <>
                            <Divider vertical my={1} opacity={0.35} />
                            <Button onPress={handleResetConfig} circular>
                              <Icon name="Trash" color="primary.contrast" />
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Grid>
            </Scrollable>
            <Box alignItems="end" ml={gap}>
              <Checkbox name="overlay" label="Overlay" checked={overlay} onChange={() => setOverlay((current) => !current)} />
            </Box>
          </Box>

          <Box row noWrap mt={gap}>
            <Box flex>
              <Select
                colorful
                name="window"
                label="Window"
                value={window}
                onChange={(e, value) => setWindow(value)}
                options={[{ value: '', label: '-- ALL --' }].concat(
                  ArrayHelper.uniqueBy(visibleWindows, 'ahk_exe').map((win) => ({
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
                )}
              />
            </Box>
            <Box ml={gap / 2} align="end">
              <Tooltip title="Refresh">
                <Button onPress={getWindows}>
                  <Icon name="Refresh" color="white" />
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Panel>

        <Panel title={`Key Locks (${locks.filter(({ lock }) => lock).length}/${locks.length})`} initialExpanded={false} mt={gap}>
          {locks.map((item, index) => (
            <Box key={item.key}>
              {index > 0 && <Divider mx={-gap} my={gap} />}

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
                <Text bold flex mx={gap}>
                  {item.name}
                </Text>
              </Box>
            </Box>
          ))}
        </Panel>

        <Panel title={`Key Bindings (${bindings.length})`} initialExpanded={false} mt={gap}>
          {bindings.map((item, bindingIndex) => (
            <Box key={bindingIndex}>
              <Box row noWrap>
                <Box row flex alignItems="center">
                  {Boolean(item.modifiers) && (
                    <Badge color="error" mr={2} my={1}>
                      WITH MODIFIERS
                    </Badge>
                  )}

                  <Text bold mr={2} my={1}>
                    WHEN
                  </Text>
                  <Badge color="info" mr={2} my={1}>
                    {item.name ?? item.key}
                  </Badge>
                  <Text bold mr={2} my={1}>
                    THEN
                  </Text>

                  {item.sequence.map((key, sequenceIndex) => (
                    <Fragment key={sequenceIndex}>
                      {sequenceIndex > 0 && (
                        <Text mr={2} my={1}>
                          ⟶
                        </Text>
                      )}
                      <Badge color="success" mr={2} my={1}>
                        {key}
                      </Badge>

                      {Boolean(item?.delay?.[sequenceIndex]) && (
                        <>
                          <Text mr={2} my={1}>
                            ⟶
                          </Text>
                          <Badge color="warning.dark" mr={2} my={1}>
                            wait {item.delay[sequenceIndex]}ms
                          </Badge>
                        </>
                      )}
                    </Fragment>
                  ))}
                </Box>

                <Box ml={gap / 2}>
                  <Tooltip title="Edit" position="left">
                    <Button variant="outline" size="small" onPress={() => handleEditBinding(bindingIndex)}>
                      <Icon name="Edit" />
                    </Button>
                  </Tooltip>
                </Box>

                <Box ml={gap / 2}>
                  <Tooltip title="Remove" position="left">
                    <Button variant="outline" size="small" color="error" onPress={() => handleDeleteBinding(bindingIndex)}>
                      <Icon name="Trash" color="error" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Divider mx={-gap} my={gap} />
            </Box>
          ))}

          <Button onPress={() => handleEditBinding()}>Add New Binding</Button>
        </Panel>

        <Panel
          title={`Advanced Scripts (${actions.filter(({ enabled }) => enabled).length}/${actions.length})`}
          initialExpanded={false}
          mt={gap}
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
                <Text bold flex mx={gap}>
                  {item.label}
                </Text>
                <Text color="text.secondary" numberOfLines={1}>
                  {`${item.script || ''}`.split(`\n`).shift()}
                </Text>
                <Box ml={gap / 2}>
                  <Tooltip title="Edit" position="left">
                    <Button variant="outline" size="small" onClick={() => setActionModel(item)}>
                      <Icon name="Edit" />
                    </Button>
                  </Tooltip>
                </Box>
                <Box ml={gap / 2}>
                  <Tooltip title="Remove" position="left">
                    <Button variant="outline" size="small" color="error" onClick={() => handleDeleteAction(item.label)}>
                      <Icon name="Trash" color="error" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Divider mx={-gap} my={gap} />
            </Box>
          ))}

          <Grid gap>
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

        <CheckUpdate />
      </Box>

      <Modal visible={browseRep} onBackdropPress={() => setBrowseRep(false)}>
        <Box m={-gap} w={320} h={320}>
          {browseRep && <GitHubRepository onChange={handleChangeGithub} />}
        </Box>
      </Modal>

      <Modal visible={typeof editConfigNameIndex === 'number'}>
        <Form w={320} onSubmit={handleSaveConfigName}>
          <Title size={1.15} center>
            Config Name
          </Title>

          <Box mt={gap}>
            <Input key={editConfigNameIndex} autoFocus name="name" value={configNames[editConfigNameIndex] ?? ''} />
          </Box>

          <Divider my={gap} mx={-gap} />

          <Grid gap m={-gap}>
            <Box xs>
              <Button variant="text" onPress={() => setEditConfigNameIndex(undefined)}>
                Cancel
              </Button>
            </Box>
            <Box xs>
              <Button type="submit">Save</Button>
            </Box>
          </Grid>
        </Form>
      </Modal>

      <Modal visible={Boolean(bindingModel)}>
        <Form key={bindingModel?.index} ref={formBindingRef} onSubmit={handleSaveBinding}>
          <Input type="hidden" name="index" value={bindingModel?.index} />

          <Title size={1.15} center>
            WHEN
          </Title>

          <Box mt={gap}>
            <Hotkey name="key" label="Trigger Key" value={bindingModel?.key} error={bindingError} />
          </Box>

          <Divider my={gap} mx={-gap} />

          <Title size={1.15} center>
            THEN
          </Title>

          {[0, 1, 2].map((keyNumber) => (
            <Box key={keyNumber} row noWrap mt={gap}>
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
                ml={gap}
                endAddon={<Text>ms</Text>}
              />
            </Box>
          ))}

          <Divider my={gap} mx={-gap} />

          <Box row noWrap alignItems="center">
            <Checkbox name="modifiers" label="Forward modifier keys" checked={bindingModel?.modifiers} mr={2} />
            <Tooltip title="Capture and forward CTRL/SHIFT/ALT/META keys">
              <Icon name="Info" size={18} />
            </Tooltip>
          </Box>

          <Box>
            <Checkbox name="loop" label="Use as toggler (enable/disable)" checked={bindingModel?.loop} />
          </Box>

          <Divider my={gap} mx={-gap} />

          <Grid gap>
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
          <Scrollable contentInset={gap}>
            <Panel title="Need help?" initialExpanded={false} m={-gap}>
              <Text>
                Feel free to use anything from{' '}
                <Link href="https://www.autohotkey.com/docs/v1" target="autohotkey">
                  AutoHotkey v1
                </Link>
                .
              </Text>
              <Text mt={gap}>Some extra functions may be used:</Text>
              <FnColor name="AdminRequired" description="Request to run Awy Bot as Administrator." />
              <FnColor
                name="VarSet"
                params="Name, Value"
                description={'Creates a variable that will be available even when the application is closed.'}
              />
              <FnColor
                name="VarGet"
                params="Name, DefaultValue"
                description={'Get value from a variable created by VarSet. DefaultValue will be returned if the variable is empty.'}
              />
              <FnColor
                name="xSend"
                params="Key, ReleaseKey := Key"
                description={'Send down a "Key" and wait the "ReleaseKey" go up to release the "Key".'}
              />
              <FnColor
                name="Notify"
                params={`Message, Duration := 500, Color := "0xFFFFFF"`}
                description="Show a notification on screen."
              />
              <FnColor name="HotkeyClear" params="Key" description="Remove brackets {} from a hotkey string." />
              <FnColor
                name="SetOverlay"
                params={'Value := 1, Key := false, Session := false'}
                description={
                  'Add text to Session on Overlay Window. When empty "Key" and "Section", "Key" will be script name and "Section" will be "Actions".'
                }
              />
              <FnColor name="ClearOverlay" params="Session" description="Reset Overlay Window content for a Session." />
              <FnColor name="MouseLock" description="User will be unable to move the mouse." />
              <FnColor name="MouseRelease" description="User will be able to move the mouse again." />
              <FnColor name="MouseBackup" description={'Backup cursor position to use with "MouseRestore"'} />
              <FnColor name="MouseRestore" description={'Restore cursor position stored from "MouseBackup"'} />
              <FnColor name="GetText" params="FromX, FromY, ToX, ToY" description="Get text from a specific screen position." />
              <FnColor name="GetFile" params="DestinationPath, URL" description="Download a file to use on custom actions." />
            </Panel>

            <Divider my={gap} mx={-gap} />

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
                mt={gap}
                fontFamily="Consolas, Courier"
              />

              <Divider my={gap} mx={-gap} />

              <Grid gap>
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
