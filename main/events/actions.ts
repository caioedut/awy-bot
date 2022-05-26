import fs from 'fs';
import path from 'path';

import { AHK_SCRIPTS_PATH } from '../constants';
import { runScript } from '../utils';

export default function actions(e, arg) {
  const body = JSON.parse(arg || '{}');
  const window = body.window || '';
  const actions = body.actions || [];

  const dir = path.join(AHK_SCRIPTS_PATH, 'actions');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    fs.readdirSync(dir).forEach((file) => fs.rmSync(path.join(dir, file)));
  }

  let cleared = false;

  for (const action of actions) {
    let script = `#Include %A_ScriptDir%\\..\\core.ahk\n`;

    if (!cleared) {
      script += 'ClearOverlay("Actions")\n';
      cleared = true;
    }

    script += `SetOverlay("${action.label}", 1, "Actions")\n${action.script || ''}\nReturn`;

    const fileName = `lb_${action.label}_action.ahk`;
    const file = path.join(dir, `${fileName}`);
    fs.writeFileSync(file, script, { encoding: 'utf-8' });

    runScript(path.join('actions', fileName), [], window);
  }

  e.returnValue = 'ok';
}
