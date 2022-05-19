import React, { useEffect, useReducer, useRef, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

type HotkeyProps = TextFieldProps & {
  value: string;
  defaultValue?: string;
};

function Hotkey(props: HotkeyProps) {
  const { onChange, value, defaultValue, ...rest } = props;

  const keysRef = useRef([]);
  const inputRef = useRef(null);

  const [hotkey, setHotkey] = useState<string>(value ?? defaultValue ?? '');
  const [editing, toggleEditing] = useReducer((state) => !state, false);

  const modifiers = {
    altKey: 'ALT',
    ctrlKey: 'CONTROL',
    metaKey: 'META',
    shiftKey: 'SHIFT',
  };

  useEffect(() => {
    setHotkey(value);
  }, [value]);

  useEffect(() => {
    inputRef.current.focus();
  }, [editing]);

  const handleKeyUp = (e) => {
    e.preventDefault();

    keysRef.current = keysRef.current.filter((item) => item !== e.keyCode);

    if (!keysRef.current.length) {
      handleChange(e);
    }
  };

  const handleKeyDown = (e) => {
    e.preventDefault();

    let { key, keyCode } = e;

    if (!keysRef.current.includes(keyCode)) {
      keysRef.current.push(keyCode);
    }

    if (key === 'Escape') {
      return setHotkey('');
    }

    if (keyCode === 32) {
      key = 'Space';
    }

    let newHotkey = Object.values(modifiers).includes(key.toUpperCase()) ? '' : key;

    for (const modifier in modifiers) {
      if (e[modifier]) {
        newHotkey = `${modifier.replace('Key', '')} + ${newHotkey}`;
      }
    }

    setHotkey(newHotkey);
  };

  const handleChange = (e) => {
    keysRef.current = [];

    const split = hotkey.split(' + ').filter(Boolean);

    for (const modifier in modifiers) {
      const index = split.findIndex((item) => item === modifiers[modifier]);

      if (index > -1) {
        split.splice(index, 1);
      }
    }

    if (!split.length) {
      setHotkey('');
    }

    if (typeof onChange === 'function') {
      onChange(e);
    }

    toggleEditing();
  };

  return (
    <TextField
      {...rest}
      inputRef={inputRef}
      disabled={!editing}
      autoFocus={editing}
      value={`${hotkey || ''}`.toUpperCase()}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleChange}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            {!editing && (
              <Tooltip title="Edit">
                <IconButton color="primary" edge="end" onClick={toggleEditing}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
}

export default Hotkey;
