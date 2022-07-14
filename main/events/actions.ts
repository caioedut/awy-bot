import fs from 'fs';
import path from 'path';

import { AHK_SCRIPTS_PATH } from '../constants';
import { runScript, runScriptSync } from '../utils';

export default function actions(e, arg) {
  const body = JSON.parse(arg || '{}');
  const { window, actions = [] } = body;

  runScriptSync('actions.ahk');

  const dir = path.join(AHK_SCRIPTS_PATH, 'actions');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    fs.readdirSync(dir).forEach((file) => fs.rmSync(path.join(dir, file)));
  }

  for (const action of actions) {
    const fileName = `lb_${action.label}_action.ahk`;
    const script = `#Include %A_ScriptDir%\\..\\core.ahk\nSetOverlay("${action.label}", 1, "Actions")\nPause, On\n#Persistent\n${
      action.script || ''
    }\nReturn`;

    const file = path.join(dir, `${fileName}`);
    fs.writeFileSync(file, script, { encoding: 'utf-8' });

    runScript(path.join('actions', fileName), [], window);
  }

  e.returnValue = 'ok';
}
