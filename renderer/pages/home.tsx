import React, { useEffect, useRef, useState } from 'react';
import electron from 'electron';
import Head from 'next/head';
import Content from '../components/Content';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Hotkey from '../components/Hotkey';
import { remap } from '../services/API';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Section from '../components/Section';
import Store from 'electron-store';

const ipcRenderer = electron.ipcRenderer || false;
const store = new Store();

const windows = [
  {
    name: 'Tibia',
    ahk_exe: 'client.exe',
    ahk_class: 'Qt5QWindowOwnDCIcon',
  },
  {
    name: 'PokeXGames',
    ahk_exe: 'pxgme.exe',
    ahk_class: 'SDL_app',
  },
  {
    name: 'Grand Line Adventures',
    ahk_exe: 'glaclient.exe',
    ahk_class: 'SDL_app',
  },
  {
    name: 'Lost Ark',
    ahk_exe: 'LOSTARK.exe',
    ahk_class: 'EFLaunchUnrealUWindowsClient',
  },
];

const defaults = [
  { group: 'mouse', key: 'MButton', remap: '', name: 'Mouse Middle' },
  { group: 'mouse', key: 'XButton1', remap: '', name: 'Mouse X1' },
  { group: 'mouse', key: 'XButton2', remap: '', name: 'Mouse X2' },
];

function Home() {
  const formRef = useRef(null);

  const [app, setApp] = useState('');

  const [bindings, setBindings] = useState<Array>(store.get('bindings', defaults));

  if (!bindings.find((item) => !item?.key && !item?.remap)) {
    bindings.push({ key: '', remap: '' });
  }

  useEffect(() => {
    store.set('bindings', bindings);
    const response = ipcRenderer.sendSync('remap', JSON.stringify(bindings));
  }, [bindings]);

  const handleClickWindow = (e) => {
    console.log('click window');
  };

  const handleChangeWindow = (e: SelectChangeEvent) => {
    setApp(e.target.value as string);
  };

  const handleChangeMouse = async (index) => {
    const remap = formRef.current[`${index}.remap`].value;

    bindings[index].remap = remap;
    setBindings([...bindings]);
  };

  const handleChangeBinding = async (index) => {
    console.log('changed', Date.now());

    const key = formRef.current[`${index}.key`].value;
    const remap = formRef.current[`${index}.remap`].value;

    const newBindings = [...bindings];
    newBindings[index] = { key, remap };

    if (!key && !remap) {
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
            <Grid item>
              <Typography variant="body2">
                <b>Window</b>
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Select value={app} onChange={handleChangeWindow} fullWidth>
                {windows.map((win, index) => (
                  <MenuItem key={index} value={`ahk_exe ${win.ahk_exe} ahk_class ${win.ahk_class}`}>
                    {win.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Section>
        </Box>

        <Box mt={2}>
          <Section title="Mouse">
            {bindings.map(
              (item, index) =>
                item.group === 'mouse' && (
                  <React.Fragment key={item.key}>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        <b>{item.name}</b>
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Hotkey
                        name={`${index}.remap`}
                        defaultValue={item.remap}
                        placeholder="New key"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                  </React.Fragment>
                ),
            )}
          </Section>
        </Box>

        <Box mt={2}>
          <Typography variant="h6" mb={1}>
            Keyboard
          </Typography>
          <Content paper>
            <Grid container spacing={2}>
              {bindings.map(
                (item, index) =>
                  item.group !== 'mouse' && (
                    <React.Fragment key={index}>
                      <Grid item xs={4}>
                        <Hotkey
                          name={`${index}.key`}
                          defaultValue={item.key}
                          placeholder="Trigger key"
                          onChange={() => handleChangeBinding(index)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <Hotkey
                          name={`${index}.remap`}
                          defaultValue={item.remap}
                          placeholder="New key"
                          onChange={() => handleChangeBinding(index)}
                          fullWidth
                        />
                      </Grid>
                    </React.Fragment>
                  ),
              )}
            </Grid>
          </Content>
        </Box>
      </form>
    </React.Fragment>
  );
}

export default Home;
