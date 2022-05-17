import React, { useReducer, useRef, useState } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

function Hotkey(props: TextFieldProps) {
  const { onChange, defaultValue, ...rest } = props;

  const keysRef = useRef([]);

  const [hotkey, setHotkey] = useState(defaultValue);
  const [editing, toggleEditing] = useReducer((state) => !state, false);

  const modifiers = {
    altKey: 'ALT',
    ctrlKey: 'CONTROL',
    metaKey: 'META',
    shiftKey: 'SHIFT',
  };

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
                <IconButton color="primary" onClick={toggleEditing}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <IconButton edge="end">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default Hotkey;
