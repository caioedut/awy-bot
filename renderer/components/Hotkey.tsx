import React, { useEffect, useRef, useState } from 'react';

import { InputProps } from '@react-bulk/core';
import { Button, Input, Tooltip } from '@react-bulk/web';
import getKeyName from 'keycode';

import Icon from './Icon';

type HotkeyProps = {
  value: string;
  defaultValue?: string;
  error?: string | boolean;
} & Omit<InputProps, 'value' | 'defaultValue' | 'error'>;

function Hotkey(props: HotkeyProps) {
  const { onChange, value, defaultValue, error, ...rest } = props;

  const keysRef = useRef([]);
  const inputRef = useRef(null);
  const hotkeyBackupRef = useRef<string>('');

  const [hotkey, setHotkey] = useState<string>(value ?? defaultValue ?? '');
  const [editing, setEditing] = useState(false);

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
    if (editing) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [editing]);

  function getModifiersStatus(e) {
    const result = {};

    for (const modifier of Object.keys(modifiers)) {
      result[modifier] = e[modifier] ?? false;
    }

    return result;
  }

  const handleMouse = (e) => {
    const buttons = {
      0: 'LButton',
      1: 'MButton',
      2: 'RButton',
      3: 'XButton1',
      4: 'XButton2',
    };

    handleKeyDown({
      ...getModifiersStatus(e),
      key: buttons[e.button],
    });
  };

  const handleWheel = (e) => {
    handleKeyDown({
      ...getModifiersStatus(e),
      key: e.deltaY < 0 ? 'WheelUp' : 'WheelDown',
    });
  };

  const handleKeyDown = (e) => {
    if (!editing) return;

    if (e.preventDefault) {
      e.preventDefault();
    }

    let { key, keyCode } = e;

    if (!keysRef.current.includes(keyCode)) {
      keysRef.current.push(keyCode);
    }

    if (key === 'Escape') {
      hotkeyBackupRef.current = '';
      return setHotkey('');
    }

    if (keyCode === 32) {
      key = 'Space';
    }

    let newHotkey = Object.values(modifiers).includes(key.toUpperCase()) ? '' : getKeyName(keyCode) ?? key;

    for (const modifier in modifiers) {
      if (e[modifier]) {
        newHotkey = `${modifier.replace('Key', '')} + ${newHotkey}`;
      }
    }

    setHotkey(newHotkey);
  };

  const handleKeyUp = (e) => {
    if (!editing) return;

    e.preventDefault();

    keysRef.current = keysRef.current.filter((item) => item !== e.keyCode);

    if (!keysRef.current.length) {
      handleChange(e);
    }
  };

  const handleFocus = () => {
    hotkeyBackupRef.current = hotkey ?? '';
    setHotkey('');
    setEditing(true);
  };

  const handleChange = (e) => {
    if (!editing) return;

    keysRef.current = [];

    const split = hotkey.split(' + ').filter(Boolean);

    for (const modifier in modifiers) {
      const index = split.findIndex((item) => item === modifiers[modifier]);

      if (index > -1) {
        split.splice(index, 1);
      }
    }

    // Reset value
    if (!split.length) {
      setHotkey(hotkeyBackupRef.current);
    }

    if (typeof onChange === 'function') {
      onChange(e, null);
    }

    setEditing(false);
  };

  return (
    <Input
      ref={inputRef}
      {...rest}
      readOnly
      autoFocus={editing}
      value={`${hotkey || ''}`.toUpperCase()}
      error={error as any}
      placeholder={editing ? `Press any key (current: ${hotkeyBackupRef.current.toUpperCase() || 'NONE'})` : 'Click to edit'}
      onFocus={handleFocus}
      onBlur={handleChange}
      onMouseDown={handleMouse}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onWheel={handleWheel}
      endAddon={
        <>
          {!editing && (
            <Tooltip title="Edit">
              <Button
                variant="text"
                circular
                mr={-2}
                onClick={handleFocus}
                style={{ cursor: 'pointer !important', '& *': { cursor: 'pointer !important' } }}
              >
                <Icon name="Edit" />
              </Button>
            </Tooltip>
          )}
        </>
      }
    />
  );
}

export default Hotkey;
