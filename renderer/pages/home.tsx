import React, { useEffect, useRef, useState } from 'react';

import electron from 'electron';
import Store from 'electron-store';
import Head from 'next/head';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import Hotkey from '../components/Hotkey';
import Section from '../components/Section';

const ipcRenderer = electron.ipcRenderer;
const store = new Store();

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

  // Collections
  const [visibleWindows, setVisibleWindows] = useState<Window[]>([]);

  // Models
  const [window, setWindow] = useState('');
  const [bindings, setBindings] = useState(store.get('bindings', defaults) as Binding[]);

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
    store.set('window', window);
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

  const handleChangeMouse = async (index) => {
    bindings[index].sequence = getSequence(index);
    setBindings([...bindings]);
  };

  const handleChangeBinding = async (index) => {
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
            <Grid item>
              <Typography variant="body2">
                <b>Window</b>
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Select value={window} onChange={handleChangeWindow}>
                {[{ title: '[Select]', ahk_id: '' }, ...visibleWindows].map((win, index) => (
                  <MenuItem key={index} value={win.ahk_id}>
                    {win.title}
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
                    <Grid item xs={2}>
                      <Typography variant="body2">
                        <b>{item.name}</b>
                      </Typography>
                    </Grid>
                    <Grid item>Remap:</Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.0`}
                        defaultValue={item.sequence?.[0]}
                        label="Key 1"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.1`}
                        defaultValue={item.sequence?.[1]}
                        label="Key 2"
                        onChange={() => handleChangeMouse(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.2`}
                        defaultValue={item.sequence?.[2]}
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
                    <Grid item xs={2}>
                      <Hotkey
                        name={`${index}.key`}
                        defaultValue={item.key}
                        label="Trigger key"
                        onChange={() => handleChangeBinding(index)}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <FormControlLabel
                        label="Loop"
                        control={
                          <Checkbox //
                            name={`${index}.loop`}
                            defaultChecked={item.loop}
                            onChange={() => handleChangeBinding(index)}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.0`}
                        defaultValue={item.sequence?.[0]}
                        label="Key 1"
                        onChange={() => handleChangeBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.1`}
                        defaultValue={item.sequence?.[1]}
                        label="Key 2"
                        onChange={() => handleChangeBinding(index)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Hotkey
                        name={`${index}.sequence.2`}
                        defaultValue={item.sequence?.[2]}
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
