import { spawn } from 'child_process';
import path from 'path';

import { AHK_EXE, AHK_SCRIPTS_PATH } from '../constants';
import { getHotkey } from '../utils';

export default function remap(e, arg) {
  const body = JSON.parse(arg || '{}');
  const script = path.join(AHK_SCRIPTS_PATH, 'remap.ahk');

  const window = body.window || '';
  const bindings = body.bindings || [];

  const params = bindings
    .filter(({ key, sequence }) => key && sequence?.length)
    .map(({ key, sequence, loop }) => {
      const value = sequence.filter(Boolean).map((item) => getHotkey(item));
      return `${getHotkey(key, false)}|${Number(loop || 0)}|${value.join(':;')}`;
    });

  spawn(AHK_EXE, [script, window, ...params]);

  e.returnValue = 'ok';
}
