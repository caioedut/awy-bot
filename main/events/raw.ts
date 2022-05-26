import fs from 'fs';
import path from 'path';

import { AHK_SCRIPTS_PATH } from '../constants';
import { runScript } from '../utils';

export default function raw(e, arg) {
  const body = JSON.parse(arg || '{}');
  const window = body.window || '';

  const raw = (body.raw || '').trim();
  const script = `#Include %A_ScriptDir%\\core.ahk\nSetOverlay("Custom Raw Script", ${Boolean(raw)})\n${raw || ''}\nReturn`;

  const file = path.join(AHK_SCRIPTS_PATH, 'raw.ahk');
  fs.writeFileSync(file, script);

  runScript('raw.ahk', [], window);

  e.returnValue = 'ok';
}
