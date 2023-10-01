import fs from 'fs';
import path from 'path';

import { AHK_SCRIPTS_PATH } from '../constants';
import { runScript, runScriptSync } from '../utils';

export default function actions(e, arg) {
  const body = JSON.parse(arg || '{}');
  const { window, actions = [] } = body;

  const newActions = actions.filter(({ changed }) => changed);
  const keepActionsLabels = actions.filter(({ changed }) => !changed).map(({ label }) => `awy_bot_${label}_action.ahk`);

  runScriptSync('actions.ahk', keepActionsLabels);

  const dir = path.join(AHK_SCRIPTS_PATH, 'actions');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    fs.readdirSync(dir)
      .filter((file) => !keepActionsLabels.includes(file))
      .forEach((file) => fs.rmSync(path.join(dir, file)));
  }

  for (const action of newActions) {
    const script = [
      '#Include %A_ScriptDir%\\..\\core.ahk',
      `SetOverlay(1, "${action.label}", "Actions")`,
      `
      OnMessage(0x0111, "LisenToPauseMessage")
      LisenToPauseMessage(wParam, lParam)
      {
        If ((wParam == 65306 || wParam == 65305) && lParam == 1) {
          BlockInput, Off
          BlockInput, MouseMoveOff
        }
      }
      `,
      'Pause, On',
      'Suspend, On',
      '#Persistent',
      '#InstallKeybdHook',
      '#InstallMouseHook',
      '#UseHook',
      action.script || '',
      'Return',
    ].join(`\n`);

    const fileName = `awy_bot_${action.label}_action.ahk`;
    const file = path.join(dir, `${fileName}`);
    fs.writeFileSync(file, script, { encoding: 'utf-8' });

    runScript(path.join('actions', fileName), [], window);
  }

  e.returnValue = 'ok';
}
