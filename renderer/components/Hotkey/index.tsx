import React, { useState } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type Props = {};

function Hotkey({ onChange, ...rest }: TextFieldProps) {
  const [hotkey, setHotkey] = useState('');

  const modifiers = {
    altKey: 'ALT',
    ctrlKey: 'CONTROL',
    metaKey: 'META',
    shiftKey: 'SHIFT',
  };

  const handleKey = (e) => {
    e.preventDefault();

    let { key, keyCode } = e;

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

  const handleBlur = (e) => {
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
  };

  return <TextField {...rest} value={`${hotkey || ''}`.toUpperCase()} onKeyDown={handleKey} onBlur={handleBlur} />;
}

export default Hotkey;
