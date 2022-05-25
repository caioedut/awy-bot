import fs from 'fs';
import path from 'path';

import { AHK_SCRIPTS_PATH } from '../constants';
import { runScript } from '../utils';

export default function raw(e, arg) {
  const body = JSON.parse(arg || '{}');
  const window = body.window || '';

  let raw = (body.raw || '').trim();

  if (raw) {
    raw = `#Include %A_ScriptDir%\\core.ahk\n${raw}`;
  }

  const file = path.join(AHK_SCRIPTS_PATH, 'raw.ahk');
  fs.writeFileSync(file, raw);

  runScript('raw.ahk', [], window);

  e.returnValue = 'ok';
}
