import { spawn, spawnSync } from 'child_process';
import path from 'path';

import { AHK_EXE, AHK_SCRIPTS_PATH } from './constants';

const _runScript = (runner: Function, script: string, params: string[] = []) => {
  return runner(AHK_EXE, [path.join(AHK_SCRIPTS_PATH, script), ...params]);
};

export const runScript = (script: string, params: string[] = [], window = '') => {
  return _runScript(spawn, script, [window, ...params]);
};

export const runScriptSync = (script: string, params: string[] = [], window = '') => {
  return _runScript(spawnSync, script, [window, ...params]);
};

export const getHotkey = (str) => {
  const parsed = str
    .replace(/\s/g, '')
    .replace(/\+/gi, '')
    .replace(/ALT/gi, '!')
    .replace(/CTRL/gi, '^')
    .replace(/SHIFT/gi, '+')
    .replace(/META/gi, '#')
    .replace(/PAGEDOWN/gi, 'PgDn')
    .replace(/PAGEUP/gi, 'PgUp')
    .toLowerCase();

  let hotkey = '';
  let checked = false;

  for (let char of parsed) {
    if (!checked && !/[!^+#]/g.test(char)) {
      checked = true;
      hotkey += '{';
    }

    hotkey += char;
  }

  hotkey += '}';

  return hotkey;
};
